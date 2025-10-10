import {
  ApplicationCommandType,
  ContainerBuilder,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
  TextDisplayBuilder
} from "discord.js";

import { CommandHandler } from "@registry";
import { RecallSequence } from "@llm";

const handler: CommandHandler<ApplicationCommandType.ChatInput> = {
  type: ApplicationCommandType.ChatInput,
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask a question about recorded topics")
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Your question")
        .setRequired(true)
    ),

  async run({ interaction }) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const statusContainer = new ContainerBuilder();
    const componentLog: string[] = [];
    const rebuildComponentLog = (msg: string, component: boolean) => {
      if (component) componentLog.push(msg);

      return componentLog.length > 0
        ? [new TextDisplayBuilder().setContent("`" + componentLog.join(" ") + "`")]
        : [];
    };

    const updateCb = async (msg: string, component: boolean = false) => {
      if (!component)
        statusContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(msg)
        );

      await interaction.editReply({
        components: [statusContainer, ...rebuildComponentLog(msg, component)],
        flags: [MessageFlags.IsComponentsV2]
      });
    };

    await updateCb("Starting job...");

    const question = interaction.options.getString("question", true);

    const result = await RecallSequence.execute(
      question,
      new Date(),
      interaction.user.id,
      interaction.guildId!,
      updateCb
    );

    if (result.length === 0)
      result.push(
        new TextDisplayBuilder().setContent(`> ${question}\n`),
        new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent([
            "**No relevant topics were found. Try asking in chat!**\n",
            "\n",
            "-# The information required to answer this question has not yet been recorded. ",
            "To record a discussion topic, open the context menu on a related message using ",
            "right-click/long-press. Then select:\n-# `Apps > Remember Topic`"
          ].join(""))
        ).setAccentColor([255, 50, 50])
      );

    await interaction.editReply({
      components: result,
      allowedMentions: { parse: [] },
      flags: [MessageFlags.IsComponentsV2]
    });
  }
};

export default handler;
