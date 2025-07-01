import { Client, ClientEvents, Collection, Events } from "discord.js";

import { FNode, read } from "./reader";
import { Logger, ind } from "@logger";
import { AnyCommandHandler, Command } from "./command";
import { AnyEventHandler, Event, EventHandler } from "./event";

export let registry: Registry | null = null;

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
  private _opts: RegistryOptions;
  private _commands: Collection<string, Command>;
  private _events: Collection<string, Event>;

  constructor(options: RegistryOptions) {
    if (registry) {
      Logger.error("Multiple instances of Registry detected");
      process.exit(1);
    }

    registry = this;

    this._opts = options;
    this._commands = new Collection();
    this._events = new Collection();
  }

  get options() {
    return this._opts;
  }

  get commands() {
    return this._commands;
  }

  get events() {
    return this._events;
  }

  async init() {
    Logger.debug("Registering [E]vents and [C]ommands...");

    await this.registerEvents();
    await this.registerCommands();
  }

  private async registerCommands() {
    await read<AnyCommandHandler>(this._opts.commandsPath, (node, depth) => {
      const cname = node.data.data.name ?? node.name ?? "undefined";
      const category = depth > 0 ? node.parent : undefined;

      Logger.debug(
        `${ind(1)}[C] ${cname.padEnd(25)} (${node.name})${category ? " <" + category + ">" : ""}`,
      );

      this._commands.set(cname, {
        handler: node.data,
        name: cname,
        category,
      });
    });
  }

  private async registerEvents() {
    await read<AnyEventHandler>(`${__dirname}/events`, (node, depth) =>
      this.registerEvent(node, depth, true),
    );

    await read<AnyEventHandler>(
      this._opts.eventsPath,
      this.registerEvent.bind(this),
    );
  }

  private registerEvent(
    node: FNode<AnyEventHandler>,
    depth: number,
    builtin: boolean = false,
  ) {
    const ename = node.parent as keyof ClientEvents;
    const ehandler = node.data as EventHandler<keyof ClientEvents>;

    const ereg = (
      ehandler.once ? this._opts.client.once : this._opts.client.on
    ).bind(this._opts.client);

    if (depth === 0 || !Object.values(Events).includes(ename as Events)) {
      Logger.error(
        `Event Registration Error: (${node.name}) Event must be within an event-named directory`,
      );
      return;
    }

    Logger.debug(
      `${ind(1, builtin ? "*" : null)}[E] ${ename.padEnd(25)} (${node.name})`,
    );

    const event = this._events.ensure(ename, () => ({
      name: ename,
      handlers: [],
    }));

    event.handlers.push(ehandler);
    ereg(ename, (...args) => ehandler.execute(...args));
  }
}
