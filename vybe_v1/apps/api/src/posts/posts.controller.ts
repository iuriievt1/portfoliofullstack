import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostsService } from "./posts.service";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.userId, dto);
  }

  @Get("feed")
  getFeed(@Req() request: Request & { user?: { userId: string } }) {
    return this.postsService.getGlobalFeed(request.user?.userId);
  }

  @Get("place/:placeId")
  getPlaceFeed(
    @Param("placeId") placeId: string,
    @Req() request: Request & { user?: { userId: string } }
  ) {
    return this.postsService.getPlaceFeed(placeId, request.user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(":id/like")
  like(@Param("id") id: string, @CurrentUser() user: { userId: string }) {
    return this.postsService.like(id, user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(":id/like")
  unlike(@Param("id") id: string, @CurrentUser() user: { userId: string }) {
    return this.postsService.unlike(id, user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: { userId: string }) {
    return this.postsService.remove(id, user.userId);
  }
}

