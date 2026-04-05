import { Body, Controller, Get, Param, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CsrfGuard } from "../common/guards/csrf.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@Controller("/api/v1/users")
@UseInterceptors(ApiResponseInterceptor)
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("/me")
  async me(@CurrentUser() user: { sub: string }) {
    return this.users.getProfile(user.sub);
  }

  @Patch("/me")
  @UseGuards(CsrfGuard)
  async updateProfile(@CurrentUser() user: { sub: string }, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.sub, dto);
  }

  @Get("/sessions")
  async sessions(@CurrentUser() user: { sub: string }) {
    return this.users.listSessions(user.sub);
  }

  @Post("/sessions/:id/revoke")
  @UseGuards(CsrfGuard)
  async revoke(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
    return this.users.revokeSession(user.sub, id);
  }
}
