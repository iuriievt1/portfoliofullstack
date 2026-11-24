-- CreateEnum
CREATE TYPE "MenuSection" AS ENUM ('KITCHEN', 'BAR', 'HOOKAH');

-- AlterTable
ALTER TABLE "MenuCategory" ADD COLUMN     "section" "MenuSection" NOT NULL DEFAULT 'KITCHEN';
