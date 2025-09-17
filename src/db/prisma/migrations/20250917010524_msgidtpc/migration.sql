/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_topicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Topic" DROP CONSTRAINT "Topic_guildSnowflake_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_guildSnowflake_fkey";

-- DropForeignKey
ALTER TABLE "public"."VerifySettings" DROP CONSTRAINT "VerifySettings_guildSnowflake_fkey";

-- AlterTable
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_pkey",
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("messageSnowflake", "topicId");

-- AddForeignKey
ALTER TABLE "public"."VerifySettings" ADD CONSTRAINT "VerifySettings_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "public"."Guild"("snowflake") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "public"."Guild"("snowflake") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "public"."Guild"("snowflake") ON DELETE CASCADE ON UPDATE CASCADE;
