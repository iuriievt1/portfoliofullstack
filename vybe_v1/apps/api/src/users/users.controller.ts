import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateMeDto } from "./dto/update-me.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMe(@CurrentUser() user: { userId: string }) {
    return this.usersService.getMe(user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("me")
  updateMe(@CurrentUser() user: { userId: string }, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(user.userId, dto);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.usersService.getPublicProfile(id);
  }
}

