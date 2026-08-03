import { NoOutputGeneratedError, streamText, type ModelMessage } from "ai";
import { deepSeek } from "@ai-sdk/deepseek";

import { tools } from "./tools/tools.ts";
import { SYSTEM_PROMPT } from "./system/prompt.ts";
import { filterCompatibleMessages } from "./system/filterMessages.ts";
import { handleStreamChunk } from "./handleStreamChunk.ts";
import type { AgentCallbacks } from "../types.ts";

export async function runAgent(
  userMessage: string,
  conversationHistory: ModelMessage[],
  callbacks?: AgentCallbacks,
): Promise<ModelMessage[]> {
  const workingHistory = filterCompatibleMessages(conversationHistory);

  const messages: ModelMessage[] = [
    ...workingHistory,
    { role: "user", content: userMessage },
  ];

  let fullResponse = "";

  while (true) {
    const { stream, finalStep } = streamText({
      model: deepSeek("deepseek-v4-pro"),
      instructions: SYSTEM_PROMPT,
      messages,
      tools,
    });

    let currentText = "";
    let streamError: Error | null = null;

    try {
      for await (const chunk of stream) {
        currentText += handleStreamChunk(chunk, callbacks);
      }
    } catch (e) {
      if (e instanceof Error) {
        streamError = e;

        if (!currentText && !NoOutputGeneratedError.isInstance(e)) {
          throw streamError;
        }
      }
    }

    fullResponse += currentText;

    if (streamError && !currentText) {
      fullResponse = "Sorry about that.";
      callbacks?.onToken(fullResponse);
      break;
    }

    const { finishReason, response } = await finalStep;

    if (finishReason !== "tool-calls") {
      messages.push(...response.messages);
      break;
    }

    messages.push(...response.messages);
  }

  callbacks?.onComplete(fullResponse);

  return messages;
}
