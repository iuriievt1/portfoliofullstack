import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

function genSecret() {
  return `mock_${crypto.randomBytes(24).toString("hex")}`;
}

export async function createOrGetPaymentIntentForRide(
  tx: Prisma.TransactionClient,
  args: {
    rideId: string;
    passengerId: string;
    method: "CARD" | "APPLE_PAY";
    amountCents: number;
    currency?: string;
  }
) {
  const currency = args.currency ?? "CZK";

  const existing = await tx.ridePayment.findUnique({ where: { rideId: args.rideId } });
  if (existing) return existing;

  return tx.ridePayment.create({
    data: {
      rideId: args.rideId,
      passengerId: args.passengerId,
      method: args.method,
      amountCents: args.amountCents,
      currency,
      status: "AUTHORIZED",
      provider: env.PAYMENT_PROVIDER,
      clientSecret: genSecret(),
      meta: { v: 1, provider: env.PAYMENT_PROVIDER }
    }
  });
}

export async function capturePaymentForRideTx(
  tx: Prisma.TransactionClient,
  args: {
    rideId: string;
    passengerId: string;
    method: "CARD" | "APPLE_PAY";
    amountCents: number;
    currency?: string;
    note?: string;
  }
) {
  const currency = args.currency ?? "CZK";

  // MOCK: автокапчер (для Swift/тестов)
  if (env.PAYMENT_PROVIDER === "MOCK" && env.PAYMENTS_MOCK_AUTO_CAPTURE) {
    const payment = await createOrGetPaymentIntentForRide(tx, {
      rideId: args.rideId,
      passengerId: args.passengerId,
      method: args.method,
      amountCents: args.amountCents,
      currency
    });

    if (payment.status !== "CAPTURED") {
      return tx.ridePayment.update({
        where: { id: payment.id },
        data: {
          status: "CAPTURED",
          amountCents: args.amountCents,
          currency,
          meta: {
            ...(payment.meta as any),
            captured: { at: new Date().toISOString(), note: args.note ?? null }
          }
        }
      });
    }

    return payment;
  }

  // Реальные провайдеры (Stripe/банк) подключим позже: тут будет вызов API и обновление статуса
  throw new HttpError(501, "PAYMENT_PROVIDER_NOT_CONFIGURED", "Payment provider not configured yet");
}

export async function ensurePaymentCapturedOrThrowTx(
  tx: Prisma.TransactionClient,
  rideId: string
) {
  const p = await tx.ridePayment.findUnique({ where: { rideId } });
  if (!p || p.status !== "CAPTURED") {
    throw new HttpError(409, "PAYMENT_NOT_CAPTURED", "Payment not captured for this ride");
  }
  return p;
}
