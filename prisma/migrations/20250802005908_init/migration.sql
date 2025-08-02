-- CreateTable
CREATE TABLE `Guild` (
    `snowflake` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`snowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerifySettings` (
    `guildSnowflake` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `suffix` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`guildSnowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `userSnowflake` VARCHAR(191) NOT NULL,
    `guildSnowflake` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_guildSnowflake_email_key`(`guildSnowflake`, `email`),
    PRIMARY KEY (`userSnowflake`, `guildSnowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VerifySettings` ADD CONSTRAINT `VerifySettings_guildSnowflake_fkey` FOREIGN KEY (`guildSnowflake`) REFERENCES `Guild`(`snowflake`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_guildSnowflake_fkey` FOREIGN KEY (`guildSnowflake`) REFERENCES `Guild`(`snowflake`) ON DELETE RESTRICT ON UPDATE CASCADE;
