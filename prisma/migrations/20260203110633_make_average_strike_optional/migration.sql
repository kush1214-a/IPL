/*
  Warnings:

  - Made the column `matches` on table `PlayerStat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `runs` on table `PlayerStat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `highest` on table `PlayerStat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fours` on table `PlayerStat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sixes` on table `PlayerStat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PlayerStat" ALTER COLUMN "matches" SET NOT NULL,
ALTER COLUMN "runs" SET NOT NULL,
ALTER COLUMN "highest" SET NOT NULL,
ALTER COLUMN "fours" SET NOT NULL,
ALTER COLUMN "sixes" SET NOT NULL;
