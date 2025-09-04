import llms from "./llms";
import { streamText, stepCountIs } from "ai";
import { tools } from "./tools";

export async function chatAgent(message: string) {
  console.log("ChatAgent called with message:", message);

  // Check if API key is available
  if (!Bun.env.GATEWAY_API_KEY) {
    console.error("GATEWAY_API_KEY environment variable is not set");
    throw new Error("API key not configured");
  }

  console.log("API key is available, proceeding with AI request");

  try {
    const response = streamText({
      model: llms.gpt5,
      tools: tools,
      stopWhen: stepCountIs(10),
      system: `You are a helpful assistant. Use the available tools to answer questions.
          Only respond to questions using information from tool calls.
          If no relevant information is found in the tool calls, respond "Sorry, I don't know."`,
      prompt: message,
      onStepFinish: (step) => {
        step.toolResults.forEach((tool) => {
          console.log("[TOOL USAGE]:", tool);
        });
      },
    });

    console.log("StreamText response created successfully");

    response.toolResults
      .then((results) => {
        results.forEach((tool) => {
          console.log("[TOOL USAGE]:", tool);
        });
      })
      .catch((error) => {
        console.error("Tool results error:", error);
      });

    return response;
  } catch (error) {
    console.error("ChatAgent error:", error);
    throw error;
  }
}
