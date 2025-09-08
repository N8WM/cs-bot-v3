import { Topic, Message } from "@prisma/client";
import { LLMProvider } from "./llmProvider";
import { LLMPrompts } from "./prompts";

type TopicWithMessages = Topic & {
  TopicMessage: Array<{
    message: Message;
    relevanceScore: number;
  }>;
};

export class LLMTransactions {
  static async getTopicBasedAnswer(query: string, topicsWithMessages: TopicWithMessages[]): Promise<string> {
    const contextMessage = LLMPrompts.formatContextMessage(query, topicsWithMessages);

    const response = await LLMProvider.chat([
      { role: "system", content: LLMPrompts.SYSTEM_PROMPT },
      { role: "user", content: contextMessage }
    ]);

    return response.message.content;
  }
}

