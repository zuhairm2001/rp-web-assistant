import llms from "../websocket/ai/llms";
import { embed } from "ai";

async function createEmbedding(text: string) {
  const embedding = await embed({
    model: llms.geminiEmbedder,
    value: text,
  });
  return embedding;
}

export default createEmbedding;
