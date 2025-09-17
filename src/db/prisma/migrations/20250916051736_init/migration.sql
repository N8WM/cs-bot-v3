/*
  Warnings:

  - Added the required column `guildSnowflake` to the `Topic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "guildSnowflake" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Guild" (
    "snowflake" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("snowflake")
);

-- CreateTable
CREATE TABLE "VerifySettings" (
    "guildSnowflake" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "suffix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerifySettings_pkey" PRIMARY KEY ("guildSnowflake")
);

-- CreateTable
CREATE TABLE "Message" (
    "messageSnowflake" TEXT NOT NULL,
    "guildSnowflake" TEXT NOT NULL,
    "channelSnowflake" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorSnowflake" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("messageSnowflake")
);

-- CreateTable
CREATE TABLE "TopicMessage" (
    "topicId" TEXT NOT NULL,
    "messageSnowflake" TEXT NOT NULL,

    CONSTRAINT "TopicMessage_pkey" PRIMARY KEY ("topicId","messageSnowflake")
);

-- CreateTable
CREATE TABLE "User" (
    "userSnowflake" TEXT NOT NULL,
    "guildSnowflake" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userSnowflake","guildSnowflake")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_guildSnowflake_email_key" ON "User"("guildSnowflake", "email");

-- AddForeignKey
ALTER TABLE "VerifySettings" ADD CONSTRAINT "VerifySettings_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "Guild"("snowflake") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "Guild"("snowflake") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "Guild"("snowflake") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMessage" ADD CONSTRAINT "TopicMessage_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMessage" ADD CONSTRAINT "TopicMessage_messageSnowflake_fkey" FOREIGN KEY ("messageSnowflake") REFERENCES "Message"("messageSnowflake") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "Guild"("snowflake") ON DELETE RESTRICT ON UPDATE CASCADE;
