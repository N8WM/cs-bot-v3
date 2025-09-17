/*
  Warnings:

  - You are about to drop the `TopicMessage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `topicId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TopicMessage" DROP CONSTRAINT "TopicMessage_messageSnowflake_fkey";

-- DropForeignKey
ALTER TABLE "TopicMessage" DROP CONSTRAINT "TopicMessage_topicId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "topicId" TEXT NOT NULL;

-- DropTable
DROP TABLE "TopicMessage";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
