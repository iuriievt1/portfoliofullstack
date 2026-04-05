import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async notifyInApp(userId: string, body: string, template = "GENERIC") {
    return this.prisma.notification.create({
      data: {
        userId,
        channel: "IN_APP",
        template,
        body,
        status: "SENT",
        sentAt: new Date()
      }
    });
  }

  async list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }
}
