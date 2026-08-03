import type { ModelMessage } from "ai";

enum MSG_ROLE {
  TOOL = "tool",
  ASSISTANT = "assistant",
  USER = "user",
}

export const filterCompatibleMessages = (
  messages: ModelMessage[],
): ModelMessage[] => {
  return messages.filter((msg) => {
    if (msg.role === MSG_ROLE.USER) {
      return true;
    }

    if (msg.role === MSG_ROLE.ASSISTANT) {
      const content = msg.content;
      if (typeof content === "string" && content.trim()) {
        return true;
      }

      if (Array.isArray(content)) {
        const hasTextContent = content.some((part: unknown) => {
          if (typeof part === "string" && part.trim()) return true;
          if (typeof part === "object" && part !== null && "text" in part) {
            const textPart = part as { text?: string };
            return textPart.text && textPart.text.trim();
          }
          return false;
        });
        return hasTextContent;
      }
    }

    if (msg.role === MSG_ROLE.TOOL) {
      return true;
    }

    return false;
  });
};
