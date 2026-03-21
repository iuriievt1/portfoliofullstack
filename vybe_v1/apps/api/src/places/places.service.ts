import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ListPlacesDto } from "./dto/list-places.dto";

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
  _count: {
    select: { likes: true }
  }
} satisfies Prisma.PostInclude;

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  list(dto: ListPlacesDto) {
    return this.prisma.place.findMany({
      where: {
        city: dto.city,
        type: dto.type
      },
      orderBy: [{ verified: "desc" }, { name: "asc" }]
    });
  }

  async getById(id: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        posts: {
          where: {
            isActive: true,
            expiresAt: { gt: new Date() }
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: basePostInclude
        }
      }
    });

    if (!place) {
      throw new NotFoundException("Place not found.");
    }

    return {
      ...place,
      posts: place.posts.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        expiresAt: post.expiresAt.toISOString(),
        likeCount: post._count.likes
      }))
    };
  }
}

