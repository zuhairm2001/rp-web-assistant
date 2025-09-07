import { createGateway } from "@ai-sdk/gateway";

const gateway = createGateway({
  apiKey: Bun.env.GATEWAY_API_KEY,
});

const deepseek = gateway.languageModel("deepseek/deepseek-v3.1");
const gpt5 = gateway.languageModel("openai/gpt-5");
const qwen = gateway.languageModel("openai/qwen-235b-instruct");
const gpt4o = gateway.languageModel("openai/gpt-4o-mini");
const gptoss = gateway.languageModel("openai/gpt-oss-120b");
const geminiEmbedder = gateway.textEmbeddingModel(
  "google/gemini-embedding-001",
);
const llms = { deepseek, gpt5, qwen, gpt4o, gptoss, geminiEmbedder };

export default llms;
