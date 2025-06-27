import {
  Client,
  PermissionsString,
  SlashCommandBuilder,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ChatInputCommandInteraction,
  UserContextMenuCommandInteraction,
  PrimaryEntryPointCommandInteraction,
  MessageContextMenuCommandInteraction,
} from "discord.js";

type CommandTypeMap = {
  [ApplicationCommandType.ChatInput]: {
    interaction: ChatInputCommandInteraction;
    builder: SlashCommandBuilder;
  };
  [ApplicationCommandType.User]: {
    interaction: UserContextMenuCommandInteraction;
    builder: ContextMenuCommandBuilder;
  };
  [ApplicationCommandType.Message]: {
    interaction: MessageContextMenuCommandInteraction;
    builder: ContextMenuCommandBuilder;
  };
  [ApplicationCommandType.PrimaryEntryPoint]: {
    interaction: PrimaryEntryPointCommandInteraction;
    builder: ContextMenuCommandBuilder;
  }
};

export type CommandHandlerInteraction<T extends ApplicationCommandType> = CommandTypeMap[T]["interaction"];

export type CommandHandlerOptions = {
  devOnly?: boolean;
  userPermissions?: PermissionsString[];
  botPermissions?: PermissionsString[];
  deleted?: boolean;
};

export type CommandHandler<T extends ApplicationCommandType> = {
  type: T;
  data: CommandTypeMap[T]["builder"];
  run: (args: {
    interaction: CommandTypeMap[T]["interaction"];
    client: Client;
  }) => Promise<any>;
  options?: CommandHandlerOptions;
};

export type AnyCommandHandler =
  | CommandHandler<ApplicationCommandType.ChatInput>
  | CommandHandler<ApplicationCommandType.User>
  | CommandHandler<ApplicationCommandType.Message>
  | CommandHandler<ApplicationCommandType.PrimaryEntryPoint>;

export type Command = {
  handler: AnyCommandHandler;
  name: string;
  category?: string;
};
