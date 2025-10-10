import { Message } from "ollama";

import { LLMSession } from "../../context/sessions/llmSession";
import { TopicSession } from "../../context/sessions/topicSession";

import { RecallTools } from "./recallTools";
import { RecallPrompts } from "./recallPrompts";
import { ExchangeBuilder } from "./exchangeBuilder";

export class RecallSequence {
  static async execute(
    question: string,
    timestamp: Date,
    askerId: string,
    guildSnowflake: string,
    updateCb: (msg: string, component?: boolean) => Promise<any>
  ) {
    const topicSession = new TopicSession({ guildSnowflake });
    const llmSession = new LLMSession();

    // Initial rephrasing prompt

    await updateCb("Processing question...");

    let response = await llmSession.message(
      {
        role: "user",
        content: RecallPrompts.rephraseQuestion(question)
      },
      { flush: true }
    );

    const rephrasedQuestion = response.message.content;

    await topicSession.findAnsweringTopics(rephrasedQuestion);

    // Answering prompt

    await updateCb("Generating an exchange...");

    const exchange = new ExchangeBuilder(topicSession);

    response = await llmSession.message(
      {
        role: "user",
        content: RecallPrompts.planExchange(
          question,
          askerId,
          timestamp.toISOString(),
          topicSession.serialized()
        )
      },
      { flush: true }
    );

    // Tool calls in order

    const tools = (whatAdded?: string[]) => [
      RecallTools.userQuote(
        exchange.messages
          .keys()
          .toArray()
          .filter((mid) => !(whatAdded ?? []).includes(mid))
      ),
      RecallTools.separator(),
      RecallTools.context()
    ];

    const toolResult: Message = { role: "tool", content: "done" };

    response = await llmSession.message(
      {
        role: "user",
        content: RecallPrompts.exchangeLoopStart()
      },
      { tools: tools(), flush: true }
    );

    let c = 0;
    let toolCalls = response.message.tool_calls ?? [];
    const whatAdded: string[] = [];

    while (toolCalls.length !== 0 && c++ < 20) {
      for (const call of toolCalls) {
        switch (call.function.name) {
          case "userQuote":
            const umArgs = call.function.arguments as { messageId: string };

            exchange.userQuote(umArgs.messageId);
            whatAdded.push(umArgs.messageId);

            await updateCb(".", true);
            break;
          case "separator":
            exchange.separator();
            whatAdded.push("separator");
            await updateCb("-", true);
            break;
          case "context":
          default:
            const cArgs = call.function.arguments as { content: string };

            exchange.context(cArgs.content);
            whatAdded.push(`"${cArgs.content}"`);

            await updateCb(">", true);
        }
        await llmSession.message(toolResult, { flush: false });
      }

      const whatAddedStr = whatAdded.length > 0
        ? whatAdded.map((f) =>
          f === "separator"
            ? `${f}()`
            : /^".*"$/.test(f)
              ? `context(${f})`
              : `userQuote("${f}")`)
          .join("\n")
        : "NOTHING YET";

      response = await llmSession.message(
        {
          role: "user",
          content: RecallPrompts.exchangeLoop(whatAddedStr)
        }, { flush: true, tools: tools(whatAdded) }
      );

      toolCalls = response.message.tool_calls ?? [];
    }

    await updateCb("Finished!");

    return exchange.components;
  }
}
