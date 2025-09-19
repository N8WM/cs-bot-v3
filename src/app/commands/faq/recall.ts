import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  InteractionContextType
} from "discord.js";

import { CommandHandler } from "@registry";
import { RecallSequence } from "@llm";

const handler: CommandHandler<ApplicationCommandType.Message> = {
  type: ApplicationCommandType.Message,
  data: new ContextMenuCommandBuilder()
    .setName("Answer Question")
    .setType(ApplicationCommandType.Message)
    .setContexts(InteractionContextType.Guild),

  async run({ interaction }) {
    await interaction.deferReply({ ephemeral: true });

    const stages: string[] = [];
    const updateCb = async (msg: string) => {
      stages.push(msg);
      await interaction.editReply({ content: stages.join("\n") });
    };

    const result = await RecallSequence.execute(
      interaction.targetMessage.content,
      interaction.targetMessage.createdAt,
      interaction.targetMessage.author.id,
      interaction.guildId!,
      updateCb
    );

    await interaction.followUp({ content: result });
  }
};

export default handler;
