import { Events, InteractionReplyOptions, MessageFlags } from "discord.js";

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
      .catch(async (e) => {
        Logger.error(`Command Error (${handler.data.name}): ${e}`);

        const response: InteractionReplyOptions = {
          content: "Yikes! There was an error processing your request.",
          flags: interaction.ephemeral ? [MessageFlags.Ephemeral] : [],
        };

        if (interaction.deferred || interaction.replied)
          await interaction.editReply({content: response.content});
        else
          await interaction.reply(response);
      });
  },
};

export default handler;
