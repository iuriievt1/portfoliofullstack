import { prisma } from "../config/prisma";
import { HttpError } from "../utils/httpError";
import { estimatePriceCents } from "./pricing.service";

const LOYALTY_PERCENT = 50;       // “reward ride” скидка
const LOYALTY_MAX_CENTS = 25000;  // 250 Kč cap

export async function computeRidePricing(params: {
  userId: string;
  tariffId: string;
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
  distanceMeters?: number;
  durationSeconds?: number;
  promoCode?: string;
  useLoyalty?: boolean;
}) {
  const useLoyalty = params.useLoyalty !== false;

  const estimate = await estimatePriceCents({
    tariffId: params.tariffId,
    pickupLat: params.pickupLat,
    pickupLng: params.pickupLng,
    destinationLat: params.destinationLat,
    destinationLng: params.destinationLng,
    distanceMeters: params.distanceMeters,
    durationSeconds: params.durationSeconds
  });

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { passengerLoyaltyCredits: true }
  });
  if (!user) throw new HttpError(404, "USER_NOT_FOUND", "User not found");

  // Loyalty discount (только если есть credits)
  let loyaltyDiscountCents = 0;
  if (useLoyalty && user.passengerLoyaltyCredits > 0) {
    loyaltyDiscountCents = Math.min(
      Math.round((estimate.priceEstimatedCents * LOYALTY_PERCENT) / 100),
      LOYALTY_MAX_CENTS
    );
  }

  // Promo discount
  let promoCodeId: string | null = null;
  let promoDiscountCents = 0;

  const code = params.promoCode?.trim();
  if (code) {
    const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!promo || !promo.isActive) throw new HttpError(400, "PROMO_INVALID", "Promo code invalid");

    const now = new Date();
    if (promo.startsAt && promo.startsAt > now) throw new HttpError(400, "PROMO_NOT_STARTED", "Promo not started yet");
    if (promo.endsAt && promo.endsAt < now) throw new HttpError(400, "PROMO_EXPIRED", "Promo expired");

    if (typeof promo.minFareCents === "number" && estimate.priceEstimatedCents < promo.minFareCents) {
      throw new HttpError(400, "PROMO_MIN_FARE", "Ride price too low for this promo");
    }

    // usage limits
    if (typeof promo.usageLimitTotal === "number") {
      const totalUsed = await prisma.promoRedemption.count({ where: { promoCodeId: promo.id } });
      if (totalUsed >= promo.usageLimitTotal) throw new HttpError(400, "PROMO_LIMIT", "Promo limit reached");
    }
    if (typeof promo.usageLimitPerUser === "number") {
      const perUserUsed = await prisma.promoRedemption.count({
        where: { promoCodeId: promo.id, userId: params.userId }
      });
      if (perUserUsed >= promo.usageLimitPerUser) throw new HttpError(400, "PROMO_USER_LIMIT", "Promo already used");
    }

    if (promo.discountType === "PERCENT") {
      promoDiscountCents = Math.round((estimate.priceEstimatedCents * promo.amount) / 100);
    } else {
      promoDiscountCents = promo.amount;
    }

    if (typeof promo.maxDiscountCents === "number") {
      promoDiscountCents = Math.min(promoDiscountCents, promo.maxDiscountCents);
    }

    promoCodeId = promo.id;
  }

  // choose best (НЕ стакаем)
  let finalPromoCodeId: string | null = null;
  let finalPromoDiscount = 0;
  let finalLoyaltyDiscount = 0;

  if (promoDiscountCents >= loyaltyDiscountCents) {
    finalPromoCodeId = promoCodeId;
    finalPromoDiscount = promoDiscountCents;
  } else {
    finalLoyaltyDiscount = loyaltyDiscountCents;
  }

  const priceFinalCents = Math.max(0, estimate.priceEstimatedCents - finalPromoDiscount - finalLoyaltyDiscount);

  return {
    ...estimate,
    priceFinalCents,
    promoCodeId: finalPromoCodeId,
    promoDiscountCents: finalPromoDiscount,
    loyaltyDiscountCents: finalLoyaltyDiscount
  };
}
