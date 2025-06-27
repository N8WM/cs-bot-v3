import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageActionRowComponentBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "discord.js";

import { getGuildSettings } from "@database";
import { CommandHandlerInteraction } from "@registry";

export function build(
  interaction: CommandHandlerInteraction<ApplicationCommandType.ChatInput>,
) {
  const settings = getGuildSettings(interaction.guildId!);

  return new ContainerBuilder()
    .setAccentColor([32, 191, 85])
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            [
              "# Cal Poly Verification\n",
              `*Use your **${settings.vrfDomainSuffix}** email address to verify your Discord `,
              `account. Successfully completing this process grants the <@&${settings.vrfRoleId}> role.*`,
            ].join(""),
          ),
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(
            "https://github.com/N8WM/cs-bot-v3/blob/main/assets/verified.png?raw=true",
          ),
        ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        [
          "1. Press the **Start Email Verification** button below\n",
          "2. Enter your Cal Poly email address to receive a six-digit verification code\n",
          "3. Press the **Enter Code** button and copy the code from the email into the prompt",
        ].join(""),
      ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(false),
    )
    .addActionRowComponents(
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("verifyButton")
          .setLabel("Start Email Verification")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("enterCodeButton")
          .setLabel("Enter Code")
          .setStyle(ButtonStyle.Secondary),
      ),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "-# The email address is only used for verification and will not be saved",
      ),
    );
}
