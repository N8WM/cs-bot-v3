import { Message } from "@prisma/client";
import { getRelatedTopics } from "@prisma/client/sql";
import { BaseService } from "./baseService";
import { LLMTransactions } from "@llm";

export class TopicService extends BaseService {
  async get(id: string) {
    return await this.prisma.topic.findUnique({ where: { id } });
  }

  async newTopic(
    guildSnowflake: string,
    name: string,
    summary: string,
    messages: Omit<Message, "topicId" | "createdAt">[]
  ) {
    const topic = await this.prisma.topic.create({
      data: {
        guildSnowflake,
        name,
        summary
      }
    });

    const msgData = messages.map((m) => ({
      guildSnowflake: m.guildSnowflake,
      channelSnowflake: m.channelSnowflake,
      messageSnowflake: m.messageSnowflake,
      topicId: topic.id
    }));

    await this.prisma.message.createMany({ data: msgData });

    return topic;
  }

  async getAnswer(query: string) {
    const related = await this.prisma.$queryRawTyped(getRelatedTopics(query));
    const topicIds = related.map((r) => r.id!);
    
    const topicsWithMessages = await this.prisma.topic.findMany({
      where: { id: { in: topicIds } },
      include: {
        TopicMessage: {
          include: {
            message: true
          }
        }
      }
    });

    return await LLMTransactions.getTopicBasedAnswer(query, topicsWithMessages);
  }
}
