-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MOCK', 'STRIPE', 'ADYEN', 'BANK', 'MANUAL');

-- CreateEnum
CREATE TYPE "RidePaymentStatus" AS ENUM ('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "cashDebtApplied" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RidePayment" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "status" "RidePaymentStatus" NOT NULL DEFAULT 'CREATED',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MOCK',
    "providerRef" TEXT,
    "clientSecret" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RidePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RidePayment_rideId_key" ON "RidePayment"("rideId");

-- CreateIndex
CREATE INDEX "RidePayment_passengerId_status_createdAt_idx" ON "RidePayment"("passengerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "RidePayment_rideId_status_idx" ON "RidePayment"("rideId", "status");

-- AddForeignKey
ALTER TABLE "RidePayment" ADD CONSTRAINT "RidePayment_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RidePayment" ADD CONSTRAINT "RidePayment_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
