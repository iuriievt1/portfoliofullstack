-- CreateEnum
CREATE TYPE "ShareStatus" AS ENUM ('ACTIVE', 'STOPPED', 'EXPIRED');

-- CreateTable
CREATE TABLE "RideShare" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ShareStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "stoppedAt" TIMESTAMP(3),
    "meta" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "RideShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RideShare_token_key" ON "RideShare"("token");

-- CreateIndex
CREATE INDEX "RideShare_rideId_status_endsAt_idx" ON "RideShare"("rideId", "status", "endsAt");

-- CreateIndex
CREATE INDEX "RideShare_userId_status_endsAt_idx" ON "RideShare"("userId", "status", "endsAt");

-- AddForeignKey
ALTER TABLE "RideShare" ADD CONSTRAINT "RideShare_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideShare" ADD CONSTRAINT "RideShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
