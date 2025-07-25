/*
  Warnings:

  - Added the required column `dateAdded` to the `VerifySettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `VerifySettings` ADD COLUMN `dateAdded` DATETIME(3) NOT NULL;
