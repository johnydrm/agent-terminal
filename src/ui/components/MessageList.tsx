import { Box, Text } from "ink";

const User: string = "user";

export interface Message {
  content: string;
  role: "user" | "assistant";
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <Box flexDirection="column" gap={1}>
      {messages.map((message, index) => (
        <Box key={index} flexDirection="column">
          <Text color={message.role === User ? "blue" : "green"} bold>
            {message.role === User ? "› You" : "› Assistant"}
          </Text>
          <Box marginLeft={2}>
            <Text>{message.content}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
