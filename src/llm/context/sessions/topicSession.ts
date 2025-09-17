import { Collection } from "discord.js";

import { ServiceManager } from "@services";
import { Result } from "@util/result";

import { UserTopic } from "../serializers/topicSerializer";
import { MessageSession } from "./messageSession";

export class TopicSession {
  private _topics: Collection<string, UserTopic>;
  private _messageSession?: MessageSession;

  private _summary?: string;
  private _existingTopicId?: string;

  constructor(messageSession?: MessageSession) {
    this._topics = new Collection();
    this._messageSession = messageSession;
  }

  get topics() {
    return this._topics;
  }

  get summary() {
    return this._summary;
  }

  get existingTopicId() {
    return this._existingTopicId;
  }

  setNewSummary(summary: string) {
    this._summary = summary;
  }

  serialized() {
    return UserTopic.joinSerialized(this._topics);
  }

  async createNewTopic() {
    return await ServiceManager.topic.newTopic(
      this._messageSession!.initialMessage.databaseMsg.guildSnowflake,
      this._summary!,
      this._messageSession!.messages.map((m) => m.databaseMsg)
    );
  }

  async findSimilarTopics() {
    const databaseTopics = await ServiceManager.topic.getRelatedTopics(this._summary!);

    databaseTopics.forEach((t) => {
      this._topics.set(t.id, new UserTopic(t));
    });
  }

  async mergeTopicMessagesWith(existingTopicId: string) {
    const databaseMsgs = await ServiceManager.topic.getMessages(existingTopicId);

    if (!databaseMsgs) return Result.err("Invalid Topic");

    this._messageSession!.merge(databaseMsgs);
    this._existingTopicId = existingTopicId;

    return Result.ok(null);
  }

  async updateExistingTopic(summary: string) {
    const topic = await ServiceManager.topic.mergeNewTopicInto(
      this._existingTopicId!,
      summary,
      this._messageSession!.messages.map((m) => m.databaseMsg)
    );

    if (!topic) return Result.err("Failed to update topic");

    return Result.ok(topic);
  }

  async overwriteExistingTopic(existingTopicId: string) {
    await ServiceManager.topic.deleteTopic(existingTopicId);
    return await this.createNewTopic();
  }
}
