import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateMeDto } from "./dto/update-me.dto";

const publicProfileSelect = {
  id: true,
  email: true,
  username: true,
  avatarUrl: true,
  bio: true,
  city: true,
  trustScore: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { email: string; username: string; city?: string; passwordHash: string }) {
    return this.prisma.user.create({
      data,
      select: {
        ...publicProfileSelect,
        passwordHash: true
      }
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        ...publicProfileSelect,
        passwordHash: true
      }
    });
  }

  findByEmailOrUsername(email: string, username: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });
  }

  async findByIdOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...publicProfileSelect,
        passwordHash: true
      }
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  async getMe(id: string) {
    const user = await this.findByIdOrThrow(id);
    return this.toAuthUser(user);
  }

  async getPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicProfileSelect
    });
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return this.toAuthUser(user);
  }

  async updateMe(id: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: publicProfileSelect
    });
    return this.toAuthUser(user);
  }

  toAuthUser(user: Pick<User, "id" | "email" | "username" | "avatarUrl" | "bio" | "city" | "trustScore" | "createdAt" | "updatedAt">) {
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }
}
