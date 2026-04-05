import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { EnvService } from "../../config/env.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly env: EnvService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const token = request.cookies?.otpbank_at ?? request.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new UnauthorizedException("Missing access token");
    }
    try {
      request.user = this.jwtService.verify(token, { secret: this.env.jwtAccessSecret });
      return true;
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }
}
