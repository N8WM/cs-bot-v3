import {
  ApplicationCommandType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { CommandHandler } from "@registry";
import { build } from "@app/components/ping";

const handler: CommandHandler<ApplicationCommandType.ChatInput> = {
  type: ApplicationCommandType.ChatInput,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription('Responds with latency values'),

  async run({ interaction }) {
    await interaction.reply({
      components: [build(interaction)],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};

export default handler;
