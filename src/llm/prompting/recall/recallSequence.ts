import { LLMSession } from "../../context/sessions/llmSession";
import { TopicSession } from "../../context/sessions/topicSession";
import { RecallPrompts } from "./recallPrompts";

export class RecallSequence {
  static async execute(
    question: string,
    timestamp: Date,
    askerId: string,
    guildSnowflake: string,
    updateCb: (msg: string) => Promise<any>
  ) {
    const topicSession = new TopicSession({ guildSnowflake });
    const llmSession = new LLMSession();

    // Initial rephrasing prompt

    updateCb("Processing question...");

    let response = await llmSession.message({
      role: "user",
      content: RecallPrompts.rephraseQuestion(question)
    });

    const rephrasedQuestion = response.message.content;

    await topicSession.findAnsweringTopics(rephrasedQuestion);

    // Answering prompt

    updateCb("Finding answer...");

    response = await llmSession.message({
      role: "user",
      content: RecallPrompts.answer(
        question,
        askerId,
        timestamp.toISOString(),
        topicSession.serialized()
      )
    });

    updateCb("Finished!");

    return response.message.content;
  }
}
