import { Events, MessageFlags } from "discord.js";

import { Logger } from "@logger";

import { Registry } from "../../registry";
import { EventHandler } from "../../event";
import { CommandHandler } from "../../command";

const handler: EventHandler<Events.InteractionCreate> = {
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = Registry.commands.get(interaction.commandName)!;
    const handler = command.handler as CommandHandler<
      typeof command.handler.type
    >;

    Logger.debug(
      `[${handler.data.name}] command from ${interaction.user.username} <${interaction.user.id}>`,
    );

    handler
      .run({ interaction: interaction, client: interaction.client })
      .catch((e) => {
        Logger.error(`Command Error (${handler.data.name}): ${e}`);
        interaction.reply({
          content:
            "My apologies, an internal error has occurred. Please try again later.",
          flags: [MessageFlags.Ephemeral],
        });
      });
  },
};

export default handler;
