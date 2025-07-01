import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

import config from "@config";
import { Registry } from "@registry";

async function main() {
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

  const registry = new Registry({
    client,
    token: config.token,
    commandsPath: config.paths.commands,
    eventsPath: config.paths.events,
    devGuildIds: config.devGuildIds,
  });

  await registry.init();
  await client.login(config.token);
}

main();
