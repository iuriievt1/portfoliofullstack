-- CreateEnum
CREATE TYPE "WalletPayoutStatus" AS ENUM ('PENDING', 'PAID', 'REJECTED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "WalletPayout" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "status" "WalletPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "destination" JSONB NOT NULL DEFAULT '{}',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "note" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "WalletPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletPayout_driverId_status_requestedAt_idx" ON "WalletPayout"("driverId", "status", "requestedAt");

-- AddForeignKey
ALTER TABLE "WalletPayout" ADD CONSTRAINT "WalletPayout_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
