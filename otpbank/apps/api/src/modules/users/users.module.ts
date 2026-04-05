import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [JwtModule.register({})],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
