import {
  ApplicationCommandType,
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";

import { CommandHandlerInteraction } from "@registry";

export type Status = {
  Success: "Success";
  Failed: "Failed";
};

export function build(options: {
  status: keyof Status;
  operation: string;
  message?: string;
}) {
  const container = new ContainerBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**${options.operation}: ${options.status}**`,
    ),
  );

  if (options.message)
    container
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(options.message),
      );

  return container;
}

export async function reply<T extends ApplicationCommandType>(
  interaction: CommandHandlerInteraction<T>,
  options: { status: keyof Status; operation: string; message?: string },
) {
  await interaction.reply({
    components: [build(options)],
    flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
  });
}
