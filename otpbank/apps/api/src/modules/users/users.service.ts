import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, roles: true }
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) throw new NotFoundException("User not found");

    if (user.profile) {
      return this.prisma.userProfile.update({
        where: { userId },
        data: dto
      });
    }

    return this.prisma.userProfile.create({
      data: { userId, ...dto }
    });
  }

  async listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastSeenAt: "desc" }
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    return this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { status: "REVOKED", refreshTokenHash: null }
    });
  }
}
