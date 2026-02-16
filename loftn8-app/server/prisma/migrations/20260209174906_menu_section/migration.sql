/*
  Warnings:

  - The values [KITCHEN,BAR] on the enum `MenuSection` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MenuSection_new" AS ENUM ('DISHES', 'DRINKS', 'HOOKAH');
ALTER TABLE "public"."MenuCategory" ALTER COLUMN "section" DROP DEFAULT;
ALTER TABLE "MenuCategory" ALTER COLUMN "section" TYPE "MenuSection_new" USING ("section"::text::"MenuSection_new");
ALTER TYPE "MenuSection" RENAME TO "MenuSection_old";
ALTER TYPE "MenuSection_new" RENAME TO "MenuSection";
DROP TYPE "public"."MenuSection_old";
ALTER TABLE "MenuCategory" ALTER COLUMN "section" SET DEFAULT 'DISHES';
COMMIT;

-- AlterTable
ALTER TABLE "MenuCategory" ALTER COLUMN "section" SET DEFAULT 'DISHES';
