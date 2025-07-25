import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

import config from "@config";
import { Registry } from "@registry";
import { PrismaClient } from "@generated/prisma";
import { ServiceManager } from "@services";

// Instantiate Prisma
const prisma = new PrismaClient();

async function main() {
  // Instantiate Client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Set up Registry
  await Registry.init({
    client,
    token: config.token,
    commandsPath: config.paths.commands,
    eventsPath: config.paths.events,
    devGuildIds: config.devGuildIds,
  });

  // Set up services
  ServiceManager.init(prisma);

  // Dispatch application
  await client.login(config.token);
}

main()
  .catch((e) => {
    console.error(e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
