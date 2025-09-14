import { Collection, Message as DiscordMessage, Snowflake } from "discord.js";

import { Result } from "@util/result";
import { UserMessage } from "../serializers/messageSerializer";

export class MessageSession {
  private _initialMessage: UserMessage;
  private _messages: Collection<Snowflake, UserMessage>;

  constructor(initialDiscordMsg: DiscordMessage) {
    this._initialMessage = new UserMessage({ discordMsg: initialDiscordMsg });
    this._messages = new Collection();
  }

  async expand(
    dir: "before" | "after" | "around" = "around",
    limit: number = 10
  ) {
    const result = await this._initialMessage.fetch(dir, limit);

    if (!result.ok) return result;

    result.value.forEach((m, id) => this._messages.set(id, m), this);
    return Result.ok(this._messages);
  }

  get messages() {
    return this._messages;
  }

  get initialMessage() {
    return this._initialMessage;
  }

  serialized() {
    return UserMessage.joinSerialized(this._messages);
  }
}
