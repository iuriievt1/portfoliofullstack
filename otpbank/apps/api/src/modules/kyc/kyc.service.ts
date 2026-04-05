import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyStatus(userId: string) {
    return this.prisma.kYCRecord.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { documents: true }
    });
  }

  async queue() {
    return this.prisma.kYCRecord.findMany({
      where: { status: { in: ["PENDING_REVIEW", "REQUIRES_ENHANCED_REVIEW"] } },
      orderBy: { createdAt: "asc" }
    });
  }
}
