-- CreateEnum
CREATE TYPE "DriverPassStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED');

-- CreateTable
CREATE TABLE "PassPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMin" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "commissionBps" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PassPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverPass" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "DriverPassStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "meta" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "DriverPass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DriverPass_driverId_status_endsAt_idx" ON "DriverPass"("driverId", "status", "endsAt");

-- AddForeignKey
ALTER TABLE "DriverPass" ADD CONSTRAINT "DriverPass_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverPass" ADD CONSTRAINT "DriverPass_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PassPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
