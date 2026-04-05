import { Controller, Get, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { KycService } from "./kyc.service";

@Controller("/api/v1/kyc")
@UseInterceptors(ApiResponseInterceptor)
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Get("/me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: { sub: string }) {
    return this.kyc.getMyStatus(user.sub);
  }

  @Get("/queue")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "COMPLIANCE_OFFICER")
  async queue() {
    return this.kyc.queue();
  }
}
