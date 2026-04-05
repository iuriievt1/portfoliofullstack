import { Module } from "@nestjs/common";
import { ConfigModule } from "./modules/config/config.module";
import { CommonModule } from "./modules/common/common.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { RedisModule } from "./modules/redis/redis.module";
import { HealthModule } from "./modules/health/health.module";
import { AuditModule } from "./modules/audit/audit.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { RiskModule } from "./modules/risk/risk.module";
import { KycModule } from "./modules/kyc/kyc.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { TransfersModule } from "./modules/transfers/transfers.module";
import { AdminModule } from "./modules/admin/admin.module";
import { SupportModule } from "./modules/support/support.module";

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    AuditModule,
    NotificationsModule,
    RiskModule,
    KycModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    TransfersModule,
    AdminModule,
    SupportModule
  ]
})
export class AppModule {}
