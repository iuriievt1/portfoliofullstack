import webpush from "web-push";
import { prisma } from "../../db/prisma";
import type { StaffRole, MenuSection } from "@prisma/client";
import { env } from "../../config/env";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string; // ВАЖНО: должен быть уникальный для события, иначе нотификации “слипаются”
  ts?: number;
};

let configured = false;

function ensureConfiguredOrThrow() {
  if (configured) return;

  const subject = env.VAPID_SUBJECT;
  const pub = env.VAPID_PUBLIC_KEY;
  const priv = env.VAPID_PRIVATE_KEY;

  if (!subject || !pub || !priv) {
    throw new Error("WebPush not configured: set VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY in .env");
  }

  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

function uniq(base: string) {
  return `${base}:${Date.now()}:${Math.random().toString(16).slice(2, 8)}`;
}

async function sendToSubscriptions(
  subs: Array<{ id: string; endpoint: string; p256dh: string; auth: string }>,
  payload: PushPayload
) {
  ensureConfiguredOrThrow();

  const safePayload: PushPayload = {
    ...payload,
    ts: payload.ts ?? Date.now(),
    // если вдруг кто-то вызвал без tag — не даём “слипнуться”
    tag: payload.tag ?? uniq("evt"),
  };

  const json = JSON.stringify(safePayload);

  let ok = 0;
  let failed = 0;
  let removed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          json,
          {
            // ✅ важно для сна/оффлайна: держим 1 час
            TTL: 60 * 60,
            // ✅ просим высокую срочность (не всегда влияет, но полезно)
            urgency: "high" as any,
          }
        );
        ok += 1;
      } catch (e: any) {
        failed += 1;

        const status = e?.statusCode;
        // протухшие подписки чистим
        if (status === 404 || status === 410) {
          removed += 1;
          await prisma.staffPushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }

        // лог — чтобы ты видел причины
        console.warn("webpush failed", {
          status,
          endpoint: s.endpoint?.slice(0, 40) + "...",
          msg: e?.message,
        });
      }
    })
  );

  return { ok, failed, removed };
}

export async function pushToStaff(staffId: string, payload: PushPayload) {
  const subs = await prisma.staffPushSubscription.findMany({
    where: { staffId },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });

  if (subs.length === 0) return { sent: 0, failed: 0, removed: 0 };

  const r = await sendToSubscriptions(subs, payload);
  return { sent: r.ok, failed: r.failed, removed: r.removed };
}

/**
 * Отправить пуш всем staff ролям в точке
 */
export async function pushToVenueRoles(venueId: number, roles: StaffRole[], payload: PushPayload) {
  const staff = await prisma.staffUser.findMany({
    where: { venueId, isActive: true, role: { in: roles } },
    select: { id: true },
  });

  const staffIds = staff.map((x) => x.id);
  if (staffIds.length === 0) return { sent: 0, failed: 0, removed: 0 };

  const subs = await prisma.staffPushSubscription.findMany({
    where: { venueId, staffId: { in: staffIds } },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });

  if (subs.length === 0) return { sent: 0, failed: 0, removed: 0 };

  const r = await sendToSubscriptions(subs, payload);
  return { sent: r.ok, failed: r.failed, removed: r.removed };
}

/**
 * ✅ FIX: ранее было по category.name ("Hookah/Kitchen/Bar"), но ты перешёл на MenuSection.
 * Теперь:
 *  - HOOKAH секция -> пуш HOOKAH + MANAGER
 *  - есть DISHES/DRINKS -> пуш WAITER + MANAGER
 */
export async function notifyOrderCreated(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      table: { select: { venueId: true, code: true } },
      items: {
        select: {
          menuItem: {
            select: {
              category: { select: { section: true } },
            },
          },
        },
      },
    },
  });
  if (!order) return;

  const venueId = order.table.venueId;
  const tableCode = order.table.code;

  const sections = order.items.map((it) => it.menuItem.category.section as MenuSection);
  const hasHookah = sections.includes("HOOKAH");
  const hasNonHookah = sections.some((s) => s !== "HOOKAH"); // DISHES/DRINKS

  const roles: StaffRole[] = ["MANAGER"];
  if (hasHookah) roles.push("HOOKAH");
  if (hasNonHookah) roles.push("WAITER");

  await pushToVenueRoles(venueId, Array.from(new Set(roles)), {
    title: "New order",
    body: `Table ${tableCode}`,
    url: "/staff/orders?status=NEW",
    // ✅ уникальный tag по событию
    tag: `order_new:${order.id}`,
    ts: Date.now(),
  });
}

export async function notifyCallCreated(callId: string) {
  const call = await prisma.staffCall.findUnique({
    where: { id: callId },
    select: { id: true, type: true, table: { select: { venueId: true, code: true } } },
  });
  if (!call) return;

  const venueId = call.table.venueId;
  const tableCode = call.table.code;

  const roles: StaffRole[] = ["MANAGER"];
  if (call.type === "HOOKAH") roles.push("HOOKAH");
  if (call.type === "WAITER") roles.push("WAITER");
  if (call.type === "HELP") roles.push("WAITER", "HOOKAH");
  if (call.type === "BILL") roles.push("WAITER");

  await pushToVenueRoles(venueId, Array.from(new Set(roles)), {
    title: "New call",
    body: `${call.type} • Table ${tableCode}`,
    url: "/staff/calls?status=NEW",
    tag: `call_new:${call.id}`,
    ts: Date.now(),
  });
}

export async function notifyPaymentRequested(paymentRequestId: string) {
  const pr = await prisma.paymentRequest.findUnique({
    where: { id: paymentRequestId },
    select: { id: true, status: true, method: true, table: { select: { venueId: true, code: true } } },
  });
  if (!pr) return;
  if (pr.status !== "PENDING") return;

  await pushToVenueRoles(pr.table.venueId, ["WAITER", "MANAGER"], {
    title: "Payment requested",
    body: `${pr.method} • Table ${pr.table.code}`,
    url: "/staff/payments?status=PENDING",
    tag: `payment_pending:${pr.id}`,
    ts: Date.now(),
  });
}
