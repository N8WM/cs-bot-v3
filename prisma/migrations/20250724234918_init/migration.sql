-- CreateTable
CREATE TABLE `Guilds` (
    `snowflake` VARCHAR(32) NOT NULL,
    `contactEmail` VARCHAR(128) NOT NULL,
    `dateAdded` DATETIME(0) NOT NULL,

    PRIMARY KEY (`snowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `userSnowflake` VARCHAR(32) NOT NULL,
    `guildSnowflake` VARCHAR(32) NOT NULL,
    `email` VARCHAR(128) NOT NULL,
    `dateAdded` DATETIME(0) NOT NULL,

    UNIQUE INDEX `Users_guildSnowflake_email_key`(`guildSnowflake`, `email`),
    PRIMARY KEY (`userSnowflake`, `guildSnowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerifySettings` (
    `guildSnowflake` VARCHAR(32) NOT NULL,
    `roleId` VARCHAR(32) NOT NULL,
    `suffix` VARCHAR(64) NOT NULL,
    `gmailAddress` VARCHAR(128) NOT NULL,
    `gmailPassword` VARCHAR(256) NOT NULL,

    PRIMARY KEY (`guildSnowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VerifySettings` ADD CONSTRAINT `VerifySettings_guildSnowflake_fkey` FOREIGN KEY (`guildSnowflake`) REFERENCES `Guilds`(`snowflake`) ON DELETE RESTRICT ON UPDATE CASCADE;
