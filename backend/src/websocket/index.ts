import { Elysia } from "elysia";
import { z } from "zod";
import { chatAgent } from "./ai/chatAgent";

const WebSocketMessageSchema = z.object({
  type: z.string(),
  content: z.string(),
});

type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

const websocketRouter = new Elysia({
  name: "websocket",
  prefix: "/ws",
}).ws("/", {
  open(ws) {
    console.log("WebSocket connection opened");
  },
  close(ws) {
    console.log("WebSocket connection closed");
  },
  async message(ws, message: WebSocketMessage) {
    console.log("Received WebSocket message:", message);

    try {
      // Parse and validate incoming message with Zod
      let messageContent: string;

      try {
        const validatedMessage = WebSocketMessageSchema.parse(message);
        console.log("Validated message:", validatedMessage);

        messageContent = validatedMessage.content;
      } catch (parseError) {
        console.error("Message parsing/validation error:", parseError);
        // Fallback to treating the entire message as content
        messageContent = "error in " + message;
      }

      console.log("Final message content:", messageContent);

      // Get streaming response from chat agent
      const response = await chatAgent(messageContent);
      const messageId = crypto.randomUUID();

      // Send message start signal
      ws.send(JSON.stringify({ type: "message_start" }));

      // Stream the text response
      for await (const chunk of response.textStream) {
        ws.send(
          JSON.stringify({
            type: "content_delta",
            delta: { text: chunk },
          }),
        );
      }

      // Send message end signal
      ws.send(JSON.stringify({ type: "message_end" }));
    } catch (error) {
      console.error("WebSocket message handling error:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          error: "Failed to process message",
          timestamp: new Date().toISOString(),
        }),
      );
    }
  },
});

export default websocketRouter;
