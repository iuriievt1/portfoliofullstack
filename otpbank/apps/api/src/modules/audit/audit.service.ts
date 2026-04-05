import { Injectable } from "@nestjs/common";
import { AuditActorType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: {
    actorType: AuditActorType;
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    reason?: string | null;
    ipAddress?: string | null;
    requestId?: string | null;
    metadataJson?: Record<string, unknown> | null;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorType: input.actorType,
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        reason: input.reason ?? null,
        ipAddress: input.ipAddress ?? null,
        requestId: input.requestId ?? null,
        metadataJson: (input.metadataJson ?? undefined) as Prisma.InputJsonValue | undefined
      }
    });
  }
}
