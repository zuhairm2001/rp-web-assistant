import { createGateway } from "@ai-sdk/gateway";

export default function createLLMS(apiKey: string) {
  const gateway = createGateway({
    apiKey: apiKey,
  });

  const deepseek = gateway.languageModel("deepseek/deepseek-v3.1");
  const gpt5 = gateway.languageModel("openai/gpt-5");
  const qwen = gateway.languageModel("openai/qwen-235b-instruct");
  const gpt4o = gateway.languageModel("openai/gpt-4o-mini");
  const gptoss = gateway.languageModel("openai/gpt-oss-120b");
  return { deepseek, gpt5, qwen, gpt4o, gptoss };
}
