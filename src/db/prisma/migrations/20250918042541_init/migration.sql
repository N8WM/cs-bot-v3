/*
  Warnings:

  - Added the required column `updatedAt` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Topic" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Guild" (
    "snowflake" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("snowflake")
);

-- CreateTable
CREATE TABLE "public"."VerifySettings" (
    "guildSnowflake" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "suffix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerifySettings_pkey" PRIMARY KEY ("guildSnowflake")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "messageSnowflake" TEXT NOT NULL,
    "guildSnowflake" TEXT NOT NULL,
    "channelSnowflake" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorSnowflake" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("messageSnowflake","topicId")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "userSnowflake" TEXT NOT NULL,
    "guildSnowflake" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userSnowflake","guildSnowflake")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_guildSnowflake_email_key" ON "public"."User"("guildSnowflake", "email");

-- AddForeignKey
ALTER TABLE "public"."VerifySettings" ADD CONSTRAINT "VerifySettings_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "public"."Guild"("snowflake") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "public"."Guild"("snowflake") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "public"."Guild"("snowflake") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topic_summary_embeddings_store" ADD CONSTRAINT "topic_summary_embeddings_store_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "public"."Guild"("snowflake") ON DELETE CASCADE ON UPDATE CASCADE;
