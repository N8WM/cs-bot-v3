import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

import config from "@config";
import { Logger } from "@logger";
import { Registry } from "@registry";
import { PrismaClient } from "@prisma/client";
import { ServiceManager } from "@services";
import { LLMProvider } from "@llm";

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
      GatewayIntentBits.MessageContent
    ]
  });

  // Set up Registry
  await Registry.init({
    client,
    token: config.token,
    commandsPath: config.paths.commands,
    eventsPath: config.paths.events,
    devGuildIds: config.devGuildIds
  });

  // Set up services
  ServiceManager.init(prisma);

  // Set up LLM Provider
  await LLMProvider.init();

  // Dispatch application
  await client.login(config.token);

  // Wait for everything to fully initialize, then test getAnswer
  setTimeout(async () => {
    const testQuery = "How do I deploy my Discord bot?";
    console.log(`\n=== Testing getAnswer with query: "${testQuery}" ===`);
    try {
      const answer = await ServiceManager.topicService.getAnswer(testQuery);
      console.log("Answer:", answer);
    } catch (error) {
      console.error("Error testing getAnswer:", error);
    }
    console.log("=== End test ===\n");
  }, 5000); // Wait 5 seconds for full initialization
}

main()
  .catch((e) => {
    Logger.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
