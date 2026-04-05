import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TransfersController } from "./transfers.controller";
import { TransfersService } from "./transfers.service";
import { AuditModule } from "../audit/audit.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { RiskModule } from "../risk/risk.module";

@Module({
  imports: [
    JwtModule.register({}),
    AuditModule,
    NotificationsModule,
    RiskModule
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService]
})
export class TransfersModule {}