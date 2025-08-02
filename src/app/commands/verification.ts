import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import { CommandHandler } from "@registry";
import { build as buildVrf } from "@app/components/verification";
import { reply } from "@app/components/status";
import { ServiceManager } from "@services";

enum Operation {
  Configure = "configure",
  Disable = "disable",
  Message = "message",
}

const handler: CommandHandler<ApplicationCommandType.ChatInput> = {
  type: ApplicationCommandType.ChatInput,
  data: new SlashCommandBuilder()
    .setName("verification")
    .setDescription(
      "Configure server verification or send verification message",
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild &
        PermissionFlagsBits.ManageMessages &
        PermissionFlagsBits.ManageRoles &
        PermissionFlagsBits.ManageChannels,
    )
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((c) =>
      c
        .setName(Operation.Configure)
        .setDescription("Configure email verification for the server")
        .addRoleOption((o) =>
          o
            .setName("role")
            .setDescription("What role should verified members be given?")
            .setRequired(true),
        )
        .addStringOption((o) =>
          o
            .setName("domain")
            .setDescription(
              'What should be the expected email domain? (E.g., "calpoly.edu")',
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((c) =>
      c
        .setName(Operation.Disable)
        .setDescription(
          "Disable verification and purge all server and member verification data for this server",
        ),
    )
    .addSubcommand((c) =>
      c
        .setName(Operation.Message)
        .setDescription(
          "Send message w/ button in this channel for members to verify their email",
        ),
    ),

  async run({ interaction }) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const op = interaction.options.getSubcommand(true) as Operation;

    switch (op) {
      case Operation.Configure:
        await configure(interaction);
        break;
      case Operation.Disable:
        await disable(interaction);
        break;
      case Operation.Message: // Fallthrough
      default:
        await message(interaction);
        break;
    }
  },
};

async function configure(interaction: ChatInputCommandInteraction) {
  const op = "Configure Verification";

  const roleId = interaction.options.getRole("role", true).id;
  const domain = interaction.options.getString("domain", true);
  const suffix = `@${domain.replace("@", "")}`;

  const result = await ServiceManager.verify.enable(
    interaction.guildId!,
    roleId,
    suffix,
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
    message:
      "You may now use the `/verification message` slash-command in " +
      "a channel you wish to send the updated verification message to.",
  });
}

async function disable(interaction: ChatInputCommandInteraction) {
  const op = "Disable Verification";
  const result = await ServiceManager.verify.disable(interaction.guildId!);

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
    message: "Verification disabled and server/member data deleted.",
  });
}

async function message(interaction: ChatInputCommandInteraction) {
  const op = "Send Verification Message";

  if (!interaction.channel?.isSendable()) {
    await reply(interaction, {
      status: "Failed",
      operation: op,
      message: "Cannot send messages in this channel",
    });
    return;
  }

  const vrf = await ServiceManager.verify.get(interaction.guildId!);

  if (!ServiceManager.verify.isEnabled(vrf)) {
    await reply(interaction, {
      status: "Failed",
      operation: op,
      message:
        "Verification is not enabled on this server.\nPlease first use " +
        "the `/verification configure` slash-command to enable it.",
    });
    return;
  }

  await interaction.channel.sendTyping();
  await interaction.channel.send({
    components: [await buildVrf(interaction)],
    flags: [MessageFlags.IsComponentsV2],
  });

  await reply(interaction, { status: "Success", operation: op });
}

export default handler;
