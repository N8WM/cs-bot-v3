import {
  MessageFlags,
  TextDisplayBuilder,
  ApplicationCommandType,
  InteractionContextType,
  ContextMenuCommandBuilder,
  ContainerBuilder
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
    await interaction.deferReply();

    const statusContainer = new ContainerBuilder();

    const updateCb = async (msg: string) => {
      statusContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(msg)
      );

      // await interaction.editReply({
      //   components: [statusContainer],
      //   flags: [MessageFlags.IsComponentsV2]
      // });
    };

    await updateCb("Warming up...");

    const result = await RecallSequence.execute(
      interaction.targetMessage.content,
      interaction.targetMessage.createdAt,
      interaction.targetMessage.author.id,
      interaction.guildId!,
      updateCb
    );

    if (result.length === 0) result.push(
      new TextDisplayBuilder()
        .setContent("Sorry, I could not find any relevant information on that.")
    );

    await interaction.editReply({
      components: result,
      allowedMentions: { parse: [] },
      flags: [MessageFlags.IsComponentsV2],
      content: undefined
    });
  }
};

export default handler;
