import { Message } from "@prisma/client";
import { BaseService } from "./baseService";

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
      },
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
}
