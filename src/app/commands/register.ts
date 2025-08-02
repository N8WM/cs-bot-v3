import {
  ApplicationCommandType,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import { CommandHandler } from "@registry";
import { reply } from "@app/components/status";
import { ServiceManager } from "@services";
import { GuildStatus } from "services/guildService";
import { Logger } from "@logger";

const handler: CommandHandler<ApplicationCommandType.ChatInput> = {
  type: ApplicationCommandType.ChatInput,
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register this server with CS Bot")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild &
        PermissionFlagsBits.ManageRoles &
        PermissionFlagsBits.ManageChannels,
    )
    .setContexts(InteractionContextType.Guild)
    .addStringOption((o) =>
      o
        .setName("contact_email")
        .setDescription("What contact email should be shown to members")
        .setRequired(true),
    ),

  async run({ interaction }) {
    Logger.debug(`Registering "${interaction.guild?.name}" <${interaction.guildId}>`);

    const op = "Register Server";
    let msg = "Registered!";

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const contactEmail = interaction.options.getString("contact_email", true);

    const result = await ServiceManager.guild.registerGuild(
      interaction.guildId!,
      contactEmail,
    );

    if (!result.ok && result.error === GuildStatus.SnowflakeAlreadyExists) {
      await ServiceManager.guild.updateContactEmail(
        interaction.guildId!,
        contactEmail,
      );
      msg = "Contact email updated!";
    }

    await reply(interaction, {
      status: "Success",
      operation: op,
      message: msg,
    });
  },
};

export default handler;
