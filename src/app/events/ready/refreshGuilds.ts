import { Events } from "discord.js";

import { Logger } from "@logger";
import { EventHandler } from "@registry";
import { ServiceManager } from "@services";

const handler: EventHandler<Events.ClientReady> = {
  async execute(client) {
    Logger.debug("Refreshing Guilds...");
    const guildIds = (await client.guilds.fetch()).map((g) => g.id);

    // Unregister any guilds that the app has been removed from
    const refreshed = await ServiceManager.guild.refreshGuilds(guildIds);
    Logger.debug(`${refreshed} guilds refreshed, ${guildIds.length - refreshed} unregistered`)
  },
  once: true,
};

export default handler;
