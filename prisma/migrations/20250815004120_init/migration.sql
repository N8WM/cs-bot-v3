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
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "guildSnowflake" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "guildSnowflake" TEXT NOT NULL,
    "channelSnowflake" TEXT NOT NULL,
    "messageSnowflake" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("guildSnowflake","channelSnowflake","messageSnowflake","topicId")
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
ALTER TABLE "Message" ADD CONSTRAINT "Message_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildSnowflake_fkey" FOREIGN KEY ("guildSnowflake") REFERENCES "Guild"("snowflake") ON DELETE RESTRICT ON UPDATE CASCADE;
