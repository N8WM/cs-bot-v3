import {
  ApplicationCommandType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import { CommandHandler } from "@registry";
import { build as buildVrf } from "@app/components/verification";
import { reply } from "@app/components/status";

const handler: CommandHandler<ApplicationCommandType.ChatInput> = {
  type: ApplicationCommandType.ChatInput,
  data: new SlashCommandBuilder()
    .setName("verification")
    .setDescription("Configure current channel to be the verification channel")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild &
        PermissionFlagsBits.ManageRoles &
        PermissionFlagsBits.ManageChannels,
    ),

  async run({ interaction }) {
    const op = "Configure Verification";

    if (!interaction.channel?.isSendable()) {
      await reply(interaction, {
        status: "Failed",
        operation: op,
        message: "Cannot send messages in this channel",
      });
      return;
    }

    await interaction.channel.sendTyping()
    await interaction.channel.send({
      components: [await buildVrf(interaction)],
      flags: [MessageFlags.IsComponentsV2]
    })

    await reply(interaction, { status: "Success", operation: op });
  },
};

export default handler;
