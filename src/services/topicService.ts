import { Message } from "@prisma/client";
import { getRelatedTopics } from "@prisma/client/sql";
import { BaseService } from "./baseService";

function msgData(
  topicId: string,
  messages: Omit<Message, "topicId" | "createdAt">[]
): Omit<Message, "createdAt">[] {
  return messages.map((m) => ({
    guildSnowflake: m.guildSnowflake,
    channelSnowflake: m.channelSnowflake,
    messageSnowflake: m.messageSnowflake,
    authorSnowflake: m.authorSnowflake,
    content: m.content,
    timestamp: m.timestamp,
    topicId
  }));
}

export class TopicService extends BaseService {
  async get(id: string) {
    return await this.prisma.topic.findUnique({ where: { id } });
  }

  async getMessages(id: string) {
    const topicWithMessages = await this.prisma.topic.findUnique({
      where: { id },
      include: { messages: true }
    });

    return topicWithMessages?.messages || null;
  }

  async newTopic(
    guildSnowflake: string,
    summary: string,
    messages: Omit<Message, "topicId" | "createdAt">[]
  ) {
    const topic = await this.prisma.topic.create({
      data: {
        guildSnowflake,
        summary
      }
    });

    await this.prisma.message.createMany({ data: msgData(topic.id, messages) });

    return topic;
  }

  async deleteTopic(id: string) {
    return await this.prisma.topic.delete({ where: { id } });
  }

  async mergeNewTopicInto(
    existingId: string,
    newSummary: string,
    messages: Omit<Message, "topicId" | "createdAt">[]
  ) {
    const topic = await this.prisma.topic.findUnique({ where: { id: existingId } });

    if (!topic) return null;

    const upserted = msgData(topic.id, messages)
      .map((m) => this.prisma.message.upsert({
        where: {
          messageSnowflake_topicId: {
            messageSnowflake: m.messageSnowflake,
            topicId: m.topicId
          }
        },
        create: m,
        update: { content: m.content }
      }));

    await this.prisma.$transaction(upserted);

    return await this.prisma.topic.update({
      where: { id: existingId },
      data: { summary: newSummary }
    });
  }

  async getRelatedTopics(query: string, guildSnowflake: string) {
    const related = await this.prisma.$queryRawTyped(getRelatedTopics(query, guildSnowflake));
    const topicIds = related.map((r) => r.id!);

    return await this.prisma.topic.findMany({
      where: { id: { in: topicIds } }
    });
  }

  async getRelatedTopicsWithMessages(query: string, guildSnowflake: string) {
    const related = await this.prisma.$queryRawTyped(getRelatedTopics(query, guildSnowflake));
    const topicIds = related.map((r) => r.id!);

    return await this.prisma.topic.findMany({
      where: { id: { in: topicIds } },
      include: { messages: true }
    });
  }
}
