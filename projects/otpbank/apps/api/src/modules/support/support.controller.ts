import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CsrfGuard } from "../common/guards/csrf.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("/api/v1/support")
@UseInterceptors(ApiResponseInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPPORT")
export class SupportController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("/users")
  async searchUsers(@Query("q") q?: string) {
    return this.prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } }
            ]
          }
        : undefined,
      include: { profile: true, roles: true },
      take: 50,
      orderBy: { createdAt: "desc" }
    });
  }

  @Get("/users/:id")
  async userDetail(@Param("id") id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        roles: true,
        accounts: { include: { cards: true } },
        sessions: true,
        notifications: true,
        kycRecords: { include: { documents: true } },
        supportNotes: { orderBy: { createdAt: "desc" } }
      }
    });
  }

  @Post("/notes")
  @UseGuards(CsrfGuard)
  async addNote(@CurrentUser() user: { sub: string }, @Body() body: { targetUserId?: string; relatedAccountId?: string; note: string }) {
    return this.prisma.supportNote.create({
      data: {
        authorUserId: user.sub,
        targetUserId: body.targetUserId ?? null,
        relatedAccountId: body.relatedAccountId ?? null,
        note: body.note
      }
    });
  }
}
