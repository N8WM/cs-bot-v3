import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

import _config from "@app/config";
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
    commandsPath: _config.paths.commands,
    eventsPath: _config.paths.events,
    devGuildIds: _config.devGuildIds,
    devUserIds: _config.devUserIds,
  });

  await registry.init();
  await client.login(_config.token);
}

main();
