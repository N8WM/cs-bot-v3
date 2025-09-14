import { Message as DiscordMessage } from "discord.js";

import { LLMSession } from "../../context/sessions/llmSession";
import { UserMessage } from "../../context/serializers/messageSerializer";
import { MessageSession } from "../../context/sessions/messageSession";

import { RecordTools } from "./recordTools";
import { RecordPrompts } from "./recordPrompts";

export class RecordSequence {
  async execute(discordMessage: DiscordMessage, loopMax: number = 15) {
    // const initialMessage = builders.fromDiscordMsg(discordMessage);
    //
    // const context: { pulled: DBMessage[]; llm: LLMMessage[] } = { pulled: [], llm: [] };
    //
    // let result = await prompt1_CE(initialMessage, context);
    // if (!result.ok) return result;
    // let tools = result.value;
    //
    // let response = await this.llm.chat(context.llm, tools);
    //
    // while (response.message.tool_calls && response.message.tool_calls.length > 0) {
    //   result = await prompt2_CR(
    //     initialMessage,
    //     context,
    //     response.message.tool_calls[0].function.arguments as any
    //   );
    //
    //   if (!result.ok) return result;
    //   tools = result.value;
    //
    //   response = await this.llm.chat(context.llm, tools);
    // }

    const messageSession = new MessageSession(discordMessage);
    const llmSession = new LLMSession();

    let result = await messageSession.expand();

    if (!result.ok) return result;

    let response = await llmSession.message(
      {
        role: "user",
        content: RecordPrompts.contextExpansion(
          messageSession.initialMessage.serialized,
          UserMessage.joinSerialized(messageSession.messages)
        )
      },
      { flush: true, tools: [RecordTools.needMoreContext()] }
    );

    let toolCalls = response.message.tool_calls;
    let call = toolCalls?.at(0);

    let c = 0;

    while (call && c++ < loopMax) {
      const args = call.function.arguments as { temporalDirection: "before" | "after" };

      result = await messageSession.expand(args.temporalDirection, 5);

      if (!result.ok) return result;

      response = await llmSession.message(
        {
          role: "user",
          content: RecordPrompts.contextExpansionLoop(
            args.temporalDirection,
            messageSession.initialMessage.serialized,
            UserMessage.joinSerialized(messageSession.messages)
          )
        },
        { flush: true, tools: [RecordTools.needMoreContext()] }
      );

      toolCalls = response.message.tool_calls;
      call = toolCalls?.at(0);
    }

    // TODO: rest of sequence
  };
}
