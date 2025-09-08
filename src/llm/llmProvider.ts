import ollama, { Message, Options, Tool } from "ollama";
import { Logger } from "@logger";

export class LLMProvider {
  private static readonly model: string = "gpt-oss:20b";
  static initialized = false;

  static async init() {
    if (LLMProvider.initialized) {
      Logger.warn("LLMProvider should only be initialized once");
      return;
    }

    Logger.debug(`Pulling LLM Model "${LLMProvider.model}"...`);

    const response = await ollama.pull({
      model: LLMProvider.model,
      stream: false
    });

    if (response.status !== "success") {
      Logger.error("Failed to pull model");
      process.exit(1);
    }

    Logger.debug("LLM Model Pulled");
    LLMProvider.initialized = true;
  }

  static async chat(
    messages: Message[],
    tools?: Tool[],
    options?: Partial<Options>
  ) {
    const response = await ollama.chat(
      {
        model: LLMProvider.model,
        messages,
        stream: false,
        think: true,
        tools,
        options
      }
    );

    return response;
  }
}

