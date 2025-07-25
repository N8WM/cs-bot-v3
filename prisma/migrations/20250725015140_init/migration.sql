/*
  Warnings:

  - You are about to drop the `Guilds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `VerifySettings` DROP FOREIGN KEY `VerifySettings_guildSnowflake_fkey`;

-- DropTable
DROP TABLE `Guilds`;

-- DropTable
DROP TABLE `Users`;

-- CreateTable
CREATE TABLE `Guild` (
    `snowflake` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `dateAdded` DATETIME(3) NOT NULL,

    PRIMARY KEY (`snowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `userSnowflake` VARCHAR(191) NOT NULL,
    `guildSnowflake` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `dateAdded` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_guildSnowflake_email_key`(`guildSnowflake`, `email`),
    PRIMARY KEY (`userSnowflake`, `guildSnowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VerifySettings` ADD CONSTRAINT `VerifySettings_guildSnowflake_fkey` FOREIGN KEY (`guildSnowflake`) REFERENCES `Guild`(`snowflake`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_guildSnowflake_fkey` FOREIGN KEY (`guildSnowflake`) REFERENCES `Guild`(`snowflake`) ON DELETE RESTRICT ON UPDATE CASCADE;
