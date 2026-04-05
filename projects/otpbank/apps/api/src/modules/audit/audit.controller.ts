import { Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("/api/v1/audit")
@UseInterceptors(ApiResponseInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "COMPLIANCE_OFFICER")
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser() user: { sub: string }, @Query("entityType") entityType?: string) {
    return this.prisma.auditLog.findMany({
      where: entityType ? { entityType } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }
}
