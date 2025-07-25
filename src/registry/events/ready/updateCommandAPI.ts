import { Events } from "discord.js";

import { Logger } from "@logger";

import { EventHandler } from "../../event";
import { CommandRegistrar } from "../../registrar";
import { Registry } from "../../registry";

const handler: EventHandler<Events.ClientReady> = {
  async execute(client) {
    Logger.info(`${client.user.username} is online`);
    Logger.debug("Updating Application [/] Command API...");

    const registrar = new CommandRegistrar(client);
    const commands = Array.from(Registry.commands.values());
    const cmdHandlers = commands
      .map((c) => c.handler)
      .filter((c) => !c.options?.deleted);

    const globalCmds = cmdHandlers.filter((c) => !c.options?.devOnly);
    const guildCmds = cmdHandlers.filter((c) => c.options?.devOnly);

    const regGuildCmds = async (id: string) =>
      await registrar.register(guildCmds, { type: "guild", guildId: id });

    await registrar.register(globalCmds, { type: "global" });
    await Promise.all(Registry.options.devGuildIds?.map(regGuildCmds) ?? []);

    Logger.info(`Ready!`);
  },
  once: true,
};

export default handler;
