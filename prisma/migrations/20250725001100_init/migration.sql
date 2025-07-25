/*
  Warnings:

  - The primary key for the `Guilds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VerifySettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `gmailPassword` on the `VerifySettings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `VarChar(191)`.

*/
-- DropForeignKey
ALTER TABLE `VerifySettings` DROP FOREIGN KEY `VerifySettings_guildSnowflake_fkey`;

-- AlterTable
ALTER TABLE `Guilds` DROP PRIMARY KEY,
    MODIFY `snowflake` VARCHAR(191) NOT NULL,
    MODIFY `contactEmail` VARCHAR(191) NOT NULL,
    MODIFY `dateAdded` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`snowflake`);

-- AlterTable
ALTER TABLE `Users` DROP PRIMARY KEY,
    MODIFY `userSnowflake` VARCHAR(191) NOT NULL,
    MODIFY `guildSnowflake` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `dateAdded` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`userSnowflake`, `guildSnowflake`);

-- AlterTable
ALTER TABLE `VerifySettings` DROP PRIMARY KEY,
    MODIFY `guildSnowflake` VARCHAR(191) NOT NULL,
    MODIFY `roleId` VARCHAR(191) NOT NULL,
    MODIFY `suffix` VARCHAR(191) NOT NULL,
    MODIFY `gmailAddress` VARCHAR(191) NOT NULL,
    MODIFY `gmailPassword` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`guildSnowflake`);

-- AddForeignKey
ALTER TABLE `VerifySettings` ADD CONSTRAINT `VerifySettings_guildSnowflake_fkey` FOREIGN KEY (`guildSnowflake`) REFERENCES `Guilds`(`snowflake`) ON DELETE RESTRICT ON UPDATE CASCADE;
