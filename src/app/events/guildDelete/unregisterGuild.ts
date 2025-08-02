import { Events } from "discord.js";

import { Logger } from "@logger";
import { EventHandler } from "@registry";
import { ServiceManager } from "@services";

const handler: EventHandler<Events.GuildDelete> = {
  async execute(guild) {
    Logger.debug(`Removed from guild "${guild.name}" <${guild.id}>`);

    // Unregister guild (if registered)
    await ServiceManager.guild.unregisterGuild(guild.id);
  },
  once: true,
};

export default handler;
