import { Module } from "@nestjs/common";
import { KycService } from "./kyc.service";
import { KycController } from "./kyc.controller";

@Module({
  providers: [KycService],
  exports: [KycService],
  controllers: [KycController]
})
export class KycModule {}
