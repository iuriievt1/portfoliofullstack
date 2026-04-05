import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AccountType, AuditActorType, Currency, SessionStatus, UserStatus } from "@prisma/client";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { EnvService } from "../config/env.service";
import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";
import { sha256, randomToken, numericCode } from "../common/utils/hash.util";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RequestOtpDto } from "./dto/request-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly env: EnvService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService
  ) {}

  private async hashPassword(password: string) {
    return argon2.hash(password, {
      memoryCost: this.env.argon2MemoryCost,
      timeCost: this.env.argon2TimeCost,
      parallelism: this.env.argon2Parallelism,
      type: argon2.argon2id
    });
  }

  private signAccessToken(payload: { sub: string; roles: string[]; sessionId: string }) {
    return this.jwt.sign(payload, {
      secret: this.env.jwtAccessSecret,
      expiresIn: this.env.jwtAccessTtl
    });
  }

  private signRefreshToken(payload: { sub: string; sessionId: string }) {
    return this.jwt.sign(payload, {
      secret: this.env.jwtRefreshSecret,
      expiresIn: this.env.jwtRefreshTtl
    });
  }

  private async createDefaultAccount(userId: string, nickname: string) {
    const ibanSuffix = Math.floor(Math.random() * 8000) + 1000;
    const iban = `CZ6508000000000000${ibanSuffix}`;
    const account = await this.prisma.account.create({
      data: {
        userId,
        type: AccountType.CURRENT,
        status: "ACTIVE",
        currency: Currency.CZK,
        iban,
        accountNumberMasked: `****${String(ibanSuffix).padStart(4, "0")}`,
        nickname,
        isPrimary: true
      }
    });

    await this.prisma.ledgerAccount.create({
      data: {
        accountId: account.id,
        code: `CUS-${ibanSuffix}`,
        name: `${nickname} liability`,
        type: "LIABILITY",
        currency: Currency.CZK
      }
    });

    return account;
  }

  async register(dto: RegisterDto, requestContext: { ipAddress?: string; requestId?: string; userAgent?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new BadRequestException("User already exists");

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        roles: { create: [{ role: "USER" }] },
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            countryCode: "CZ"
          }
        },
        consents: {
          createMany: {
            data: [
              { type: "TERMS", version: "1.0" },
              { type: "PRIVACY", version: "1.0" }
            ]
          }
        },
        kycRecords: { create: { provider: "mock", status: "IN_PROGRESS" } }
      },
      include: { roles: true, profile: true }
    });

    await this.createDefaultAccount(user.id, dto.firstName ? `${dto.firstName} account` : "Main account");
    await this.notifications.notifyInApp(user.id, "Welcome to OTPBank.", "WELCOME");
    await this.audit.log({
      actorType: AuditActorType.USER,
      actorUserId: user.id,
      action: "AUTH_REGISTER",
      entityType: "User",
      entityId: user.id,
      ipAddress: requestContext.ipAddress ?? null,
      requestId: requestContext.requestId ?? null
    });

    return user;
  }

  async login(dto: LoginDto, requestContext: { ipAddress?: string; requestId?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { roles: true }
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException("Account temporarily locked");
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      const failedLoginCount = user.failedLoginCount + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount,
          lockedUntil: failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
        }
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    const roles = user.roles.map((item) => item.role);
    const csrfToken = randomToken(16);
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        status: SessionStatus.ACTIVE,
        deviceFingerprint: dto.deviceFingerprint,
        deviceName: dto.deviceName ?? "Browser session",
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
        expiresAt: new Date(Date.now() + this.env.jwtRefreshTtl * 1000),
        csrfToken
      }
    });

    const accessToken = this.signAccessToken({ sub: user.id, roles, sessionId: session.id });
    const refreshToken = this.signRefreshToken({ sub: user.id, sessionId: session.id });

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: sha256(refreshToken),
        lastSeenAt: new Date()
      }
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null }
    });

    await this.audit.log({
      actorType: AuditActorType.USER,
      actorUserId: user.id,
      action: "AUTH_LOGIN",
      entityType: "Session",
      entityId: session.id,
      ipAddress: requestContext.ipAddress ?? null,
      requestId: requestContext.requestId ?? null
    });

    return { userId: user.id, roles, sessionId: session.id, accessToken, refreshToken, csrfToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify<{ sub: string; sessionId: string }>(refreshToken, { secret: this.env.jwtRefreshSecret });
      const session = await this.prisma.session.findUnique({ where: { id: payload.sessionId }, include: { user: { include: { roles: true } } } });
      if (!session || session.status !== "ACTIVE" || session.expiresAt < new Date()) throw new UnauthorizedException("Invalid session");
      if (!session.refreshTokenHash || session.refreshTokenHash !== sha256(refreshToken)) throw new UnauthorizedException("Refresh token revoked");

      const roles = session.user.roles.map((item) => item.role);
      const newAccessToken = this.signAccessToken({ sub: session.user.id, roles, sessionId: session.id });
      const newRefreshToken = this.signRefreshToken({ sub: session.user.id, sessionId: session.id });

      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: sha256(newRefreshToken),
          expiresAt: new Date(Date.now() + this.env.jwtRefreshTtl * 1000),
          csrfToken: randomToken(16),
          lastSeenAt: new Date()
        }
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken, sessionId: session.id };
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(sessionId: string) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.REVOKED,
        refreshTokenHash: null
      }
    });
  }

  async requestOtp(userId: string, dto: RequestOtpDto) {
    const code = numericCode(6);
    const otp = await this.prisma.oTP.create({
      data: {
        userId,
        purpose: dto.purpose,
        codeHash: sha256(code),
        destination: dto.destination,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
    await this.notifications.notifyInApp(userId, `Mock OTP for ${dto.purpose}: ${code}`, "OTP_ISSUED");
    return { otpId: otp.id, expiresAt: otp.expiresAt, mockCode: code };
  }

  async verifyOtp(userId: string, dto: VerifyOtpDto) {
    const otp = await this.prisma.oTP.findFirst({ where: { id: dto.otpId, userId, status: "PENDING" } });
    if (!otp || otp.expiresAt < new Date()) throw new BadRequestException("OTP expired");
    if (otp.codeHash !== sha256(dto.code)) throw new BadRequestException("Invalid OTP");
    await this.prisma.oTP.update({ where: { id: otp.id }, data: { status: "USED", consumedAt: new Date() } });
    return { verified: true };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        profile: true,
        sessions: { where: { status: "ACTIVE" }, orderBy: { lastSeenAt: "desc" } }
      }
    });
  }
}
