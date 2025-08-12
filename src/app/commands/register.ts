import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
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

enum Operation {
  Register = "register",
  Unregister = "unregister",
}

const handler: CommandHandler<ApplicationCommandType.ChatInput> = {
  type: ApplicationCommandType.ChatInput,
  data: new SlashCommandBuilder()
    .setName("registration")
    .setDescription("Register or unregister this server with CS Bot")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild &
        PermissionFlagsBits.ManageRoles &
        PermissionFlagsBits.ManageChannels,
    )
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((c) =>
      c
        .setName(Operation.Register)
        .setDescription("Register this server with CS Bot")
        .addStringOption((o) =>
          o
            .setName("contact_email")
            .setDescription("What contact email should be shown to members")
            .setRequired(true),
        ),
    )
    .addSubcommand((c) =>
      c
        .setName(Operation.Unregister)
        .setDescription("Unregister this server with CS Bot"),
    ),

  async run({ interaction }) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const op = interaction.options.getSubcommand(true) as Operation;

    switch (op) {
      case Operation.Register:
        await register(interaction);
        break;
      case Operation.Unregister: // Fallthrough
      default:
        await unregister(interaction);
        break;
    }
  },
};

async function register(interaction: ChatInputCommandInteraction) {
  Logger.debug(
    `Registering "${interaction.guild?.name}" <${interaction.guildId}>`,
  );

  const op = "Register Server";
  let msg = "Registered!";

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
}

async function unregister(interaction: ChatInputCommandInteraction) {
  Logger.debug(
    `Unregistering "${interaction.guild?.name}" <${interaction.guildId}>`,
  );

  const op = "Unregister Server";
  let msg = "Unregistered!";

  const result = await ServiceManager.guild.unregisterGuild(
    interaction.guildId!,
  );

  if (!result.ok) {
    await reply(interaction, {
      status: "Failed",
      operation: op,
      message: result.error,
    });
    return;
  }

  await reply(interaction, {
    status: "Success",
    operation: op,
    message: msg,
  });
}

export default handler;
