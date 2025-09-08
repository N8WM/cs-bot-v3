import { Topic } from "@prisma/client";

type TopicWithMessages = Topic & {
  TopicMessage: Array<{
    message: {
      id: string;
      guildSnowflake: string;
      channelSnowflake: string;
      messageSnowflake: string;
      createdAt: Date;
    };
    relevanceScore: number;
  }>;
};

export class LLMPrompts {
  static readonly SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on provided context from Discord conversations.

Your role:
- Answer questions using ONLY the context provided in the user message
- Be concise but comprehensive in your responses
- If the context doesn't contain enough information to answer the question, say so
- Reference specific topics when relevant
- Maintain a helpful and professional tone

Guidelines:
- Do not make assumptions beyond what's in the context
- If multiple topics are relevant, synthesize information across them
- Focus on the most relevant information for the user's question
- If the question cannot be answered from the context, explain what information is missing`;

  static formatContextMessage(query: string, topicsWithMessages: TopicWithMessages[]): string {
    let contextMessage = `<question>\n${query}\n</question>\n\n`;
    
    contextMessage += `<context>\n`;
    
    if (topicsWithMessages.length > 0) {
      contextMessage += `<topics>\n`;
      topicsWithMessages.forEach((topic, topicIndex) => {
        contextMessage += `<topic id="${topic.id}" index="${topicIndex + 1}">\n`;
        contextMessage += `<name>${topic.name}</name>\n`;
        contextMessage += `<summary>${topic.summary}</summary>\n`;
        contextMessage += `<created>${topic.createdAt.toISOString()}</created>\n`;
        
        if (topic.TopicMessage.length > 0) {
          contextMessage += `<messages>\n`;
          topic.TopicMessage
            .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
            .forEach((topicMessage, msgIndex) => {
              contextMessage += `<message index="${msgIndex + 1}" relevance="${topicMessage.relevanceScore}">\n`;
              contextMessage += `<guild>${topicMessage.message.guildSnowflake}</guild>\n`;
              contextMessage += `<channel>${topicMessage.message.channelSnowflake}</channel>\n`;
              contextMessage += `<messageId>${topicMessage.message.messageSnowflake}</messageId>\n`;
              contextMessage += `<created>${topicMessage.message.createdAt.toISOString()}</created>\n`;
              contextMessage += `</message>\n\n`;
            });
          contextMessage += `</messages>\n`;
        }
        
        contextMessage += `</topic>\n\n`;
      });
      contextMessage += `</topics>\n`;
    }
    
    contextMessage += `</context>\n\n`;
    contextMessage += `Please answer the question based on the provided context.`;
    
    return contextMessage;
  }
}