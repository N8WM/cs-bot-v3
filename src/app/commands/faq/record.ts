import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  InteractionContextType
} from "discord.js";

import { CommandHandler } from "@registry";
import { RecordSequence } from "@llm";

const handler: CommandHandler<ApplicationCommandType.Message> = {
  type: ApplicationCommandType.Message,
  data: new ContextMenuCommandBuilder()
    .setName("Remember Topic")
    .setType(ApplicationCommandType.Message)
    .setContexts(InteractionContextType.Guild),

  async run({ interaction }) {
    await interaction.deferReply({ ephemeral: true });

    const stages: string[] = [];
    const updateCb = async (msg: string) => {
      stages.push(msg);
      await interaction.editReply({ content: stages.join("\n") });
    };

    const result = await RecordSequence.execute(interaction.targetMessage, updateCb);

    if (!result.ok) throw result.error;

    await updateCb(`\nSummary:\n${result.value.summary}`);

    await interaction.followUp({ content: "Topic recorded!", ephemeral: true });
  }
};

export default handler;
