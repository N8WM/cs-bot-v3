/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `topicId` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guildSnowflake,channelSnowflake,messageSnowflake]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Message` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_topicId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
DROP COLUMN "topicId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "TopicMessage" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TopicMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicMessage_topicId_messageId_key" ON "TopicMessage"("topicId", "messageId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_guildSnowflake_channelSnowflake_messageSnowflake_key" ON "Message"("guildSnowflake", "channelSnowflake", "messageSnowflake");

-- AddForeignKey
ALTER TABLE "TopicMessage" ADD CONSTRAINT "TopicMessage_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMessage" ADD CONSTRAINT "TopicMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
