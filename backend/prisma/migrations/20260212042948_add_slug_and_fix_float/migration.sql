/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ConditionCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `ConditionCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ConditionCategory_name_key";

-- AlterTable
ALTER TABLE "AssessmentCondition" ALTER COLUMN "value_scale" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ConditionCategory" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ConditionCategory_slug_key" ON "ConditionCategory"("slug");
