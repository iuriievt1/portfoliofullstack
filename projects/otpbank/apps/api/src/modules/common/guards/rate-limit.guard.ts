import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Request } from "express";
import { EnvService } from "../../config/env.service";
import { RedisService } from "../../redis/redis.service";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService, private readonly env: EnvService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const key = `rate:${request.ip}:${request.method}:${request.route?.path ?? request.url}`;
    const count = await this.redis.increment(key, this.env.rateLimitTtl);
    if (count > this.env.rateLimitMax) throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
    return true;
  }
}
