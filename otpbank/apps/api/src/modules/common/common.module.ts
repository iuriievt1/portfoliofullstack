import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { CsrfGuard } from "./guards/csrf.guard";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import { ApiResponseInterceptor } from "./api-response.interceptor";

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtAuthGuard, RolesGuard, CsrfGuard, RateLimitGuard, ApiResponseInterceptor],
  exports: [JwtAuthGuard, RolesGuard, CsrfGuard, RateLimitGuard, ApiResponseInterceptor, JwtModule]
})
export class CommonModule {}
