import { Message as DiscordMessage } from "discord.js";

import { LLMSession } from "../../context/sessions/llmSession";
import { TopicSession } from "../../context/sessions/topicSession";
import { MessageSession } from "../../context/sessions/messageSession";

import { RecordTools } from "./recordTools";
import { RecordPrompts } from "./recordPrompts";
import { Result } from "@util/result";

export class RecordSequence {
  static async execute(
    discordMessage: DiscordMessage,
    updateCb: (msg: string) => Promise<any>,
    loopMax: number = 15
  ) {
    const messageSession = new MessageSession(discordMessage);
    const topicSession = new TopicSession(messageSession);
    const llmSession = new LLMSession();

    // Initial prompt

    updateCb("Analyzing message...");

    let result = await messageSession.expand("around");

    if (!result.ok) return result;

    let response = await llmSession.message(
      {
        role: "user",
        content: RecordPrompts.contextExpansion(
          messageSession.initialMessage.serialized,
          messageSession.serialized()
        )
      },
      { flush: true, tools: [RecordTools.needMoreContext()] }
    );

    let toolCalls = response.message.tool_calls;
    let call = toolCalls?.at(0);

    // Context expansion loop

    let c = 0;

    while (call && c++ < loopMax) {
      updateCb(`Expanding context (${c})...`);

      const args = call.function.arguments as { temporalDirection: "before" | "after" };

      result = await messageSession.expand(args.temporalDirection, 5);

      if (!result.ok) return result;

      response = await llmSession.message(
        {
          role: "user",
          content: RecordPrompts.contextExpansionLoop(
            args.temporalDirection,
            messageSession.initialMessage.serialized,
            messageSession.serialized()
          )
        },
        { flush: true, tools: [RecordTools.needMoreContext()] }
      );

      toolCalls = response.message.tool_calls;
      call = toolCalls?.at(0);
    }

    // Context refinement

    updateCb("Refining context...");

    llmSession.forget();

    let ids = messageSession.messages.map((m) => m.databaseMsg.messageSnowflake);

    response = await llmSession.message(
      {
        role: "user",
        content: RecordPrompts.contextRefinementPrompt(
          messageSession.initialMessage.serialized,
          messageSession.serialized()
        )
      },
      {
        flush: true,
        tools: [RecordTools.removeMessages(ids)]
      }
    );

    toolCalls = response.message.tool_calls;
    call = toolCalls?.at(0);

    if (call) {
      const args = call.function.arguments as { messageIds: string[] };
      messageSession.refine(args.messageIds);
    }

    // Summarization

    updateCb("Summarizing topic...");

    llmSession.forget();

    response = await llmSession.message(
      {
        role: "user",
        content: RecordPrompts.summarizationPrompt(
          messageSession.initialMessage.serialized,
          messageSession.serialized()
        )
      },
      { flush: true }
    );

    const summary = response.message.content;

    // Check for similar topics

    updateCb("Checking for similar topics...");

    topicSession.setNewSummary(summary);
    await topicSession.findSimilarTopics();

    ids = topicSession.topics.map((t) => t.databaseTopic.id);

    response = await llmSession.message(
      {
        role: "user",
        content: RecordPrompts.integrationPrompt(
          summary,
          topicSession.serialized()
        )
      },
      {
        flush: true,
        tools: [
          RecordTools.updateExistingTopic(ids),
          RecordTools.overwriteExistingTopic(ids)
        ]
      }
    );

    toolCalls = response.message.tool_calls;
    call = toolCalls?.at(0);

    if (!call) {
      updateCb("Creating new topic...");
      return Result.ok(await topicSession.createNewTopic());
    }

    const funcs = ["updateExistingTopic", "overwriteExistingTopic"] as const;

    const func = call.function.name as typeof funcs[number];

    if (!funcs.includes(func))
      return Result.err("Function call name not recognized");

    const args = call.function.arguments as { existingTopicId: string };

    if (func === "overwriteExistingTopic") {
      updateCb("Replacing an old topic...");

      return Result.ok(await topicSession.overwriteExistingTopic(args.existingTopicId));
    }

    // Need to generate a new summary for combined topics

    updateCb("Merging with another topic...");

    await topicSession.mergeTopicMessagesWith(args.existingTopicId);

    llmSession.forget();

    response = await llmSession.message(
      {
        role: "user",
        content: RecordPrompts.summarizationPrompt(
          messageSession.initialMessage.serialized,
          messageSession.serialized()
        )
      },
      { flush: true }
    );

    const newSummary = response.message.content;
    const updateResult = await topicSession.updateExistingTopic(newSummary);

    updateCb("Finished!");

    return updateResult;
  }
}
