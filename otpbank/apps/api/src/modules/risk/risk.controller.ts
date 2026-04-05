import { Controller, Get, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { RiskService } from "./risk.service";

@Controller("/api/v1/risk")
@UseInterceptors(ApiResponseInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "RISK_ANALYST", "COMPLIANCE_OFFICER")
export class RiskController {
  constructor(private readonly risk: RiskService) {}

  @Get()
  async list() {
    return this.risk.listOpen();
  }
}
