import { Collection, Snowflake } from "discord.js";
import { create } from "xmlbuilder2";

import { Topic, Message } from "@prisma/client";
import { escapeCData } from "./utilitySerializer";
import { msgJSON, UserMessage } from "./messageSerializer";

export type TopicWithMessages = Topic & { messages: Message[] };

export class UserTopic {
  private _databaseTopic: Topic | TopicWithMessages;
  private _serialized?: string;
  private _databaseMsgs?: Message[];

  constructor(databaseTopic: Topic | TopicWithMessages) {
    this._databaseTopic = databaseTopic;
    if ("messages" in databaseTopic)
      this._databaseMsgs = databaseTopic.messages;
  }

  get databaseTopic() {
    return this._databaseTopic;
  }

  get serialized() {
    if (this._serialized) return this._serialized;

    if (this._databaseMsgs === undefined)
      this._serialized = serializeTopic(this._databaseTopic);
    else
      this._serialized = serializeTopicWithMsgs(
        this._databaseTopic,
        this._databaseMsgs
      );

    return this._serialized;
  }

  get databaseMsgs() {
    return this._databaseMsgs;
  }

  static joinSerialized(topics: Collection<Snowflake, UserTopic>) {
    return topics.map((t) => t.serialized).join("\n\n");
  }
}

const serializeTopic = (topic: Topic) => create({
  Topic: {
    "@id": topic.id,
    "Summary": { $: escapeCData(topic.summary) }
  }
}).end({ prettyPrint: true, headless: true });

const serializeTopicWithMsgs = (topic: Topic, messages: Message[]) => create({
  Topic: {
    "@id": topic.id,
    "Summary": { $: escapeCData(topic.summary) },
    "Messages": {
      Message: messages
        .toSorted(UserMessage.dbComparator)
        .map((m) => msgJSON(m).Message)
    }
  }
}).end({ prettyPrint: true, headless: true });
