import type { TextStreamPart, ToolSet } from "ai";

import type { AgentCallbacks } from "../types.ts";

export function handleStreamChunk(
  chunk: TextStreamPart<ToolSet>,
  callbacks?: AgentCallbacks,
): string {
  switch (chunk.type) {
    case "text-delta": {
      callbacks?.onToken(chunk.text);
      return chunk.text;
    }
    case "tool-call": {
      const input = "input" in chunk ? chunk.input : {};
      callbacks?.onToolCallStart(chunk.toolName, input);
      return "";
    }
    case "tool-result": {
      callbacks?.onToolCallEnd(chunk.toolName, chunk.output as string);
      return "";
    }
    default: {
      return "";
    }
  }
}
