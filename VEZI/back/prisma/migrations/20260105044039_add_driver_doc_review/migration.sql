-- AlterTable
ALTER TABLE "DriverDocument" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT;

-- CreateIndex
CREATE INDEX "DriverDocument_driverId_status_createdAt_idx" ON "DriverDocument"("driverId", "status", "createdAt");
