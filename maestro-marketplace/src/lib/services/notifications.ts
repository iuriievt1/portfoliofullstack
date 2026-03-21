import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
}) {
  return db.notification.create({
    data: input
  });
}
