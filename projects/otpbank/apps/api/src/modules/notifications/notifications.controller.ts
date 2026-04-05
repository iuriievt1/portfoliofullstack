import { Controller, Get, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";

@Controller("/api/v1/notifications")
@UseInterceptors(ApiResponseInterceptor)
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: { sub: string }) {
    return this.notifications.list(user.sub);
  }
}
