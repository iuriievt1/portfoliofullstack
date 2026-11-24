-- CreateTable
CREATE TABLE "StaffPushSubscription" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "venueId" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffPushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffPushSubscription_endpoint_key" ON "StaffPushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "StaffPushSubscription_staffId_idx" ON "StaffPushSubscription"("staffId");

-- CreateIndex
CREATE INDEX "StaffPushSubscription_venueId_idx" ON "StaffPushSubscription"("venueId");

-- AddForeignKey
ALTER TABLE "StaffPushSubscription" ADD CONSTRAINT "StaffPushSubscription_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffPushSubscription" ADD CONSTRAINT "StaffPushSubscription_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
