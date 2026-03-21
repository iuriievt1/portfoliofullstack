import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { CrowdLevel, NoiseLevel, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto } from "./dto/create-post.dto";

const basePostInclude = {
  user: {
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      city: true,
      trustScore: true
    }
  },
  place: {
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      city: true
    }
  },
  likes: {
    select: {
      userId: true
    }
  },
  _count: {
    select: { likes: true }
  }
} satisfies Prisma.PostInclude;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    await this.ensurePlace(dto.placeId);

    const post = await this.prisma.post.create({
      data: {
        userId,
        placeId: dto.placeId,
        text: dto.text,
        imageUrl: dto.imageUrl,
        vibe: dto.vibe,
        crowdLevel: dto.crowdLevel as CrowdLevel,
        noiseLevel: dto.noiseLevel as NoiseLevel,
        waitTimeMin: dto.waitTimeMin ?? null,
        expiresAt: new Date(Date.now() + dto.expiresInHours * 60 * 60 * 1000)
      },
      include: basePostInclude
    });

    return this.serializePost(post, userId);
  }

  async getGlobalFeed(currentUserId?: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
        place: { city: "Prague" }
      },
      orderBy: { createdAt: "desc" },
      include: basePostInclude,
      take: 50
    });

    return posts.map((post) => this.serializePost(post, currentUserId));
  }

  async getPlaceFeed(placeId: string, currentUserId?: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        placeId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" },
      include: basePostInclude,
      take: 50
    });

    return posts.map((post) => this.serializePost(post, currentUserId));
  }

  async like(postId: string, userId: string) {
    await this.ensurePost(postId);
    await this.prisma.like.upsert({
      where: {
        userId_postId: { userId, postId }
      },
      create: { userId, postId },
      update: {}
    });
    return { success: true };
  }

  async unlike(postId: string, userId: string) {
    await this.prisma.like.deleteMany({
      where: { userId, postId }
    });
    return { success: true };
  }

  async remove(postId: string, userId: string) {
    const post = await this.ensurePost(postId);
    if (post.userId !== userId) {
      throw new ForbiddenException("You can only delete your own posts.");
    }
    await this.prisma.post.delete({ where: { id: postId } });
    return { success: true };
  }

  private async ensurePlace(placeId: string) {
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) {
      throw new NotFoundException("Place not found.");
    }
    return place;
  }

  private async ensurePost(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("Post not found.");
    }
    return post;
  }

  private serializePost(
    post: Prisma.PostGetPayload<{ include: typeof basePostInclude }>,
    currentUserId?: string
  ) {
    return {
      id: post.id,
      text: post.text,
      imageUrl: post.imageUrl,
      vibe: post.vibe,
      crowdLevel: post.crowdLevel,
      noiseLevel: post.noiseLevel,
      waitTimeMin: post.waitTimeMin,
      isActive: post.isActive,
      expiresAt: post.expiresAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      likeCount: post._count.likes,
      likedByMe: currentUserId ? post.likes.some((like) => like.userId === currentUserId) : false,
      user: post.user,
      place: post.place
    };
  }
}

