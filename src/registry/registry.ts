import { Client, ClientEvents, Collection, Events } from "discord.js";

import { FNode, read } from "./reader";
import { Logger, ind } from "@logger";
import { AnyCommandHandler, Command } from "./command";
import { AnyEventHandler, Event, EventHandler } from "./event";

export type RegistryOptions = {
  client: Client;
  token: string;
  commandsPath: string;
  eventsPath: string;
  devGuildIds?: string[];
  devUserIds?: string[];
  devRoleIds?: string[];
};

export class Registry {
  private static _opts: RegistryOptions;
  private static _commands: Collection<string, Command>;
  private static _events: Collection<string, Event>;

  static initialized = false;

  static get options() {
    return Registry._opts;
  }

  static get commands() {
    return Registry._commands;
  }

  static get events() {
    return Registry._events;
  }

  static async init(options: RegistryOptions) {
    if (Registry.initialized) {
      Logger.warn("Registry should only be initialized once");
      return;
    }

    Registry._opts = options;
    Registry._commands = new Collection();
    Registry._events = new Collection();

    Logger.debug("Registering [E]vents and [C]ommands...");

    await Registry.registerEvents();
    await Registry.registerCommands();

    Registry.initialized = true;
  }

  private static async registerCommands() {
    await read<AnyCommandHandler>(
      Registry._opts.commandsPath,
      (node, depth) => {
        const cname = node.data.data.name ?? node.name ?? "undefined";
        const category = depth > 0 ? node.parent : undefined;

        Logger.debug(
          `${ind(1)}[C] ${cname.padEnd(25)} (${node.name})${category ? " <" + category + ">" : ""}`,
        );

        Registry._commands.set(cname, {
          handler: node.data,
          name: cname,
          category,
        });
      },
    );
  }

  private static async registerEvents() {
    await read<AnyEventHandler>(`${__dirname}/events`, (node, depth) =>
      Registry.registerEvent(node, depth, true),
    );

    await read<AnyEventHandler>(
      Registry._opts.eventsPath,
      Registry.registerEvent,
    );
  }

  private static registerEvent(
    node: FNode<AnyEventHandler>,
    depth: number,
    builtin: boolean = false,
  ) {
    const ename = node.parent as keyof ClientEvents;
    const ehandler = node.data as EventHandler<keyof ClientEvents>;

    const ereg = (
      ehandler.once ? Registry._opts.client.once : Registry._opts.client.on
    ).bind(Registry._opts.client);

    if (depth === 0 || !Object.values(Events).includes(ename as Events)) {
      Logger.error(
        `Event Registration Error: (${node.name}) Event must be within an event-named directory`,
      );
      return;
    }

    Logger.debug(
      `${ind(1, builtin ? "*" : null)}[E] ${ename.padEnd(25)} (${node.name})`,
    );

    const event = Registry._events.ensure(ename, () => ({
      name: ename,
      handlers: [],
    }));

    event.handlers.push(ehandler);
    ereg(ename, (...args) => ehandler.execute(...args));
  }
}
