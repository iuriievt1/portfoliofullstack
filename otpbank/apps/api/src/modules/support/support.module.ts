import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { SupportController } from "./support.controller";

@Module({
  imports: [JwtModule.register({})],
  controllers: [SupportController]
})
export class SupportModule {}
