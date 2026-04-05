import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { Request, Response } from "express";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CsrfGuard } from "../common/guards/csrf.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { EnvService } from "../config/env.service";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RequestOtpDto } from "./dto/request-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

@Controller("/api/v1/auth")
@UseInterceptors(ApiResponseInterceptor)
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly env: EnvService) {}

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.env.cookieSecure,
      sameSite: "lax" as const,
      domain: this.env.cookieDomain || undefined,
      path: "/"
    };
  }

  @Post("/register")
  @UseGuards(RateLimitGuard)
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.register(dto, {
      ipAddress: req.ip,
      requestId: (req as Request & { correlationId?: string }).correlationId,
      userAgent: req.headers["user-agent"]
    });
    const session = await this.auth.login(
      { email: dto.email, password: dto.password, deviceName: "Web registration", deviceFingerprint: req.header("x-device-fingerprint") ?? undefined },
      { ipAddress: req.ip, requestId: (req as Request & { correlationId?: string }).correlationId, userAgent: req.headers["user-agent"] }
    );

    res.cookie("otpbank_at", session.accessToken, { ...this.cookieOptions(), maxAge: this.env.jwtAccessTtl * 1000 });
    res.cookie("otpbank_rt", session.refreshToken, { ...this.cookieOptions(), maxAge: this.env.jwtRefreshTtl * 1000 });
    res.cookie("otpbank_csrf", session.csrfToken, {
      httpOnly: false,
      secure: this.env.cookieSecure,
      sameSite: "lax",
      path: "/",
      domain: this.env.cookieDomain || undefined,
      maxAge: this.env.jwtRefreshTtl * 1000
    });
    return { user, sessionId: session.sessionId };
  }

  @Post("/login")
  @UseGuards(RateLimitGuard)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await this.auth.login(dto, {
      ipAddress: req.ip,
      requestId: (req as Request & { correlationId?: string }).correlationId,
      userAgent: req.headers["user-agent"]
    });
    res.cookie("otpbank_at", session.accessToken, { ...this.cookieOptions(), maxAge: this.env.jwtAccessTtl * 1000 });
    res.cookie("otpbank_rt", session.refreshToken, { ...this.cookieOptions(), maxAge: this.env.jwtRefreshTtl * 1000 });
    res.cookie("otpbank_csrf", session.csrfToken, {
      httpOnly: false,
      secure: this.env.cookieSecure,
      sameSite: "lax",
      path: "/",
      domain: this.env.cookieDomain || undefined,
      maxAge: this.env.jwtRefreshTtl * 1000
    });
    return { sessionId: session.sessionId, roles: session.roles };
  }

  @Post("/refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.otpbank_rt;
    const session = await this.auth.refresh(token);
    res.cookie("otpbank_at", session.accessToken, { ...this.cookieOptions(), maxAge: this.env.jwtAccessTtl * 1000 });
    res.cookie("otpbank_rt", session.refreshToken, { ...this.cookieOptions(), maxAge: this.env.jwtRefreshTtl * 1000 });
    return { sessionId: session.sessionId };
  }

  @Post("/logout")
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async logout(@CurrentUser() user: { sessionId: string }, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(user.sessionId);
    res.clearCookie("otpbank_at");
    res.clearCookie("otpbank_rt");
    res.clearCookie("otpbank_csrf");
    return { loggedOut: true };
  }

  @Get("/me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: { sub: string }) {
    return this.auth.me(user.sub);
  }

  @Post("/otp/request")
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async requestOtp(@CurrentUser() user: { sub: string }, @Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(user.sub, dto);
  }

  @Post("/otp/verify")
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async verifyOtp(@CurrentUser() user: { sub: string }, @Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(user.sub, dto);
  }
}
