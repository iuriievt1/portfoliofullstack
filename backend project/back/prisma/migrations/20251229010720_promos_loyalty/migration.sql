-- CreateEnum
CREATE TYPE "PromoDiscountType" AS ENUM ('PERCENT', 'FIXED');

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "loyaltyDiscountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyReverted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promoCodeId" TEXT,
ADD COLUMN     "promoDiscountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rewardsApplied" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passengerCompletedRides" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passengerLoyaltyCredits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "PromoDiscountType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "maxDiscountCents" INTEGER,
    "minFareCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "usageLimitTotal" INTEGER,
    "usageLimitPerUser" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoRedemption" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoRedemption_promoCodeId_userId_idx" ON "PromoRedemption"("promoCodeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoRedemption_rideId_key" ON "PromoRedemption"("rideId");

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoRedemption" ADD CONSTRAINT "PromoRedemption_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoRedemption" ADD CONSTRAINT "PromoRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoRedemption" ADD CONSTRAINT "PromoRedemption_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;
