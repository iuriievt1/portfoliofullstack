import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { Request } from "express";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CsrfGuard } from "../common/guards/csrf.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { IDEMPOTENCY_HEADER } from "../common/constants";
import { CreateTransferDto } from "./dto/create-transfer.dto";
import { ManualAdjustmentDto } from "./dto/manual-adjustment.dto";
import { TransfersService } from "./transfers.service";

@Controller("/api/v1")
@UseInterceptors(ApiResponseInterceptor)
export class TransfersController {
  constructor(private readonly transfers: TransfersService) {}

  @Post("/transfers")
  @UseGuards(JwtAuthGuard, CsrfGuard)
  async createTransfer(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateTransferDto,
    @Headers(IDEMPOTENCY_HEADER) idempotencyKey: string,
    @Req() req: Request
  ) {
    return this.transfers.createTransfer(user.sub, dto, idempotencyKey, {
      ipAddress: req.ip,
      requestId: (req as Request & { correlationId?: string }).correlationId
    });
  }

  @Get("/transactions/:id")
  @UseGuards(JwtAuthGuard)
  async detail(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
    return this.transfers.transactionDetail(user.sub, id);
  }

  @Get("/admin/transactions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "RISK_ANALYST", "COMPLIANCE_OFFICER")
  async all() {
    return this.transfers.listAllForOps();
  }

  @Post("/admin/adjustments")
  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @Roles("ADMIN")
  async manualAdjustment(
    @CurrentUser() user: { sub: string },
    @Body() dto: ManualAdjustmentDto,
    @Headers(IDEMPOTENCY_HEADER) idempotencyKey: string,
    @Req() req: Request
  ) {
    return this.transfers.manualAdjustment(user.sub, dto, idempotencyKey, {
      ipAddress: req.ip,
      requestId: (req as Request & { correlationId?: string }).correlationId
    });
  }
}
