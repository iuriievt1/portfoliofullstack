import { Body, Controller, Get, Param, Patch, UseGuards, UseInterceptors } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CsrfGuard } from "../common/guards/csrf.guard";

@Controller("/api/v1/admin")
@UseInterceptors(ApiResponseInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPPORT", "RISK_ANALYST", "COMPLIANCE_OFFICER")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("/users")
  async users() {
    return this.prisma.user.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { roles: true, profile: true }
    });
  }

  @Get("/users/:id")
  async user(@Param("id") id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
        profile: true,
        accounts: true,
        sessions: true,
        kycRecords: { include: { documents: true } }
      }
    });
  }

  @Get("/operations")
  async operations() {
    const [users, transfers, riskOpen] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.transfer.count(),
      this.prisma.riskEvent.count({ where: { status: "OPEN" } })
    ]);
    return { users, transfers, riskOpen };
  }

  @Patch("/accounts/:id/freeze")
  @UseGuards(CsrfGuard)
  @Roles("ADMIN", "RISK_ANALYST")
  async freeze(@Param("id") id: string, @Body() body: { reason?: string }) {
    return this.prisma.account.update({
      where: { id },
      data: { status: "FROZEN", frozenReason: body.reason ?? "Manual freeze" }
    });
  }

  @Patch("/accounts/:id/unfreeze")
  @UseGuards(CsrfGuard)
  @Roles("ADMIN", "RISK_ANALYST")
  async unfreeze(@Param("id") id: string) {
    return this.prisma.account.update({
      where: { id },
      data: { status: "ACTIVE", frozenReason: null }
    });
  }

  @Patch("/cards/:id/freeze")
  @UseGuards(CsrfGuard)
  @Roles("ADMIN", "RISK_ANALYST")
  async freezeCard(@Param("id") id: string) {
    return this.prisma.card.update({
      where: { id },
      data: { status: "FROZEN" }
    });
  }

  @Patch("/cards/:id/unfreeze")
  @UseGuards(CsrfGuard)
  @Roles("ADMIN", "RISK_ANALYST")
  async unfreezeCard(@Param("id") id: string) {
    return this.prisma.card.update({
      where: { id },
      data: { status: "ACTIVE" }
    });
  }
}
