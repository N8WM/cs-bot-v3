import { Collection, Message as DiscordMessage, Snowflake } from "discord.js";

import { Result } from "@util/result";
import { Message as DBMessage } from "@prisma/client";
import { UserMessage } from "../serializers/messageSerializer";

export class MessageSession {
  private _initialMessage: UserMessage;
  private _messages: Collection<Snowflake, UserMessage>;

  constructor(initialDiscordMsg: DiscordMessage) {
    this._initialMessage = new UserMessage({ discordMsg: initialDiscordMsg });
    this._messages = new Collection();
  }

  async expand(
    dir: "before" | "after" | "around",
    limit: number = 10
  ) {
    const result = await this._initialMessage.fetch(dir, limit);

    if (!result.ok) return result;

    this._messages.set(
      this._initialMessage.databaseMsg.messageSnowflake,
      this._initialMessage
    );

    result.value.forEach((m, id) => this._messages.set(id, m), this);

    return Result.ok(this._messages);
  }

  refine(ids: Snowflake[]) {
    ids.forEach((id) => this._messages.delete(id), this);
    return this._messages;
  }

  get messages() {
    return this._messages;
  }

  get initialMessage() {
    return this._initialMessage;
  }

  merge(additionalMsgs: DBMessage[]) {
    additionalMsgs.forEach(
      (m) => this._messages.set(
        m.messageSnowflake,
        new UserMessage({ databaseMsg: m })
      ),
      this
    );
  }

  serialized() {
    return UserMessage.joinSerialized(this._messages);
  }
}
