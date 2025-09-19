import { create } from "xmlbuilder2";
import { Collection, Message as DiscordMessage, Snowflake } from "discord.js";
import { Message as DBMessage } from "@prisma/client";
import * as utilitySerializer from "./utilitySerializer";
import { InterfaceManager } from "../interfaceManager";
import { Result } from "@util/result";

export type UserMessageOptions
  = { discordMsg: DiscordMessage }
    | { databaseMsg: DBMessage }
    | { discordMsg: DiscordMessage; databaseMsg: DBMessage };

export class UserMessage {
  private _discordMsg?: DiscordMessage;
  private _databaseMsg: DBMessage;
  private _serialized?: string;

  private _EOFBefore: boolean = false;
  private _EOFAfter: boolean = false;

  static readonly dbComparator = (a: DBMessage, b: DBMessage) =>
    a.timestamp.getTime() - b.timestamp.getTime();

  static readonly umComparator = (a: UserMessage, b: UserMessage) =>
    a._databaseMsg.timestamp.getTime() - b._databaseMsg.timestamp.getTime();

  constructor(options: UserMessageOptions) {
    this._discordMsg = "discordMsg" in options
      ? options.discordMsg
      : undefined;

    this._databaseMsg = "databaseMsg" in options
      ? options.databaseMsg
      : fromDiscordMsg(options.discordMsg);
  }

  get discordMsg() {
    return this._discordMsg;
  }

  get databaseMsg() {
    return this._databaseMsg;
  }

  get serialized() {
    if (!this._serialized)
      this._serialized = serializeMessage(this._databaseMsg);

    const marked = [
      eofMarker(this._EOFBefore, "before"),
      this._serialized,
      eofMarker(this._EOFAfter, "after")
    ].filter((s) => s !== "").join("\n\n");

    return marked;
  }

  get eofBefore() {
    return this._EOFBefore;
  }

  get eofAfter() {
    return this._EOFAfter;
  }

  async ensureDiscordMsg() {
    if (this._discordMsg) return;

    const result = await InterfaceManager.messages.getMessage(
      this._databaseMsg.guildSnowflake,
      this._databaseMsg.channelSnowflake,
      this._databaseMsg.messageSnowflake
    );

    if (result.ok) this._discordMsg = result.value;
  }

  async fetch(
    temporalDirection: "before" | "after" | "around" = "around",
    limit: number = 10
  ) {
    await this.ensureDiscordMsg();

    if (!this._discordMsg) return Result.err("Invalid Message");

    const msgResult = await InterfaceManager.messages.getMessages(
      this._discordMsg,
      temporalDirection,
      limit
    );

    const userMsgResult = Result.map(
      msgResult,
      (ms) => ms.mapValues(
        (m) => new UserMessage({ discordMsg: m })
      )
    );

    if (!userMsgResult.ok) return userMsgResult;

    if (userMsgResult.value.size === 0) {
      this._EOFBefore = temporalDirection !== "after";
      this._EOFAfter = temporalDirection !== "before";

      return userMsgResult;
    }

    const messages = userMsgResult.value.sorted(UserMessage.umComparator);

    if (temporalDirection !== "after") messages.first()!.checkEOF(temporalDirection);
    if (temporalDirection !== "before") messages.last()!.checkEOF(temporalDirection);

    return userMsgResult;
  }

  static joinSerialized(messages: Collection<Snowflake, UserMessage>) {
    return messages
      .sorted(UserMessage.umComparator)
      .map((m) => m.serialized).join("\n\n");
  }

  private async checkEOF(temporalDirection: "before" | "after" | "around") {
    if (temporalDirection !== "after") await this.fetch("before", 1);
    if (temporalDirection !== "before") await this.fetch("after", 1);
  }
}

const fromDiscordMsg = (discordMessage: DiscordMessage): DBMessage => ({
  guildSnowflake: discordMessage.guildId!,
  channelSnowflake: discordMessage.channelId,
  messageSnowflake: discordMessage.id,
  authorSnowflake: discordMessage.author.id,
  content: discordMessage.content,
  timestamp: discordMessage.createdAt,
  createdAt: new Date(),
  topicId: ""
});

export const msgJSON = (message: DBMessage) => ({
  Message: {
    "@id": message.messageSnowflake,
    "@timestamp": message.timestamp.toISOString(),
    "InlineMention": {
      $: utilitySerializer.messageLink(
        message.guildSnowflake,
        message.channelSnowflake,
        message.messageSnowflake
      )
    },
    "Author": {
      "@id": message.authorSnowflake,
      "InlineMention": {
        $: utilitySerializer.userMention(message.authorSnowflake)
      }
    },
    "Channel": {
      "@id": message.channelSnowflake,
      "InlineMention": {
        $: utilitySerializer.channelMention(message.channelSnowflake)
      }
    },
    "Content": { $: utilitySerializer.escapeCData(message.content) }
  }
});

const serializeMessage = (message: DBMessage) => create(
  msgJSON(message)
).end({ prettyPrint: true, headless: true });

const eofMarker = (eof: boolean, temporalDirection: "before" | "after") => eof
  ? create({
      EOF: {
        "@side": temporalDirection
      }
    }).end({ prettyPrint: true, headless: true })
  : "";
