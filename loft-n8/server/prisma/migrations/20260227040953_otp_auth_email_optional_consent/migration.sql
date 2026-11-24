-- AlterTable
ALTER TABLE "User" ADD COLUMN     "privacyAcceptedAt" TIMESTAMP(3),
ALTER COLUMN "email" DROP NOT NULL;
