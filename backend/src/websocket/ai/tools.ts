import z from "zod";
import { tool, ToolSet } from "ai";

export const getWooCommerceProducts = tool({
  name: "getWooCommerceProducts",
  description:
    "When the user is requesting a product, provide a link and information about it.",
  inputSchema: z.object({
    name: z.string().describe("The name of the product"),
  }),
  execute: async ({ name }) => {
    return `https://example.com/products/${name}`;
  },
});

export const getWeather = tool({
  name: "getWeather",
  description:
    "When the user is requesting weather information, provide the current weather conditions.",
  inputSchema: z.object({
    location: z
      .string()
      .describe("The location for which to get weather information"),
  }),
  execute: async ({ location }) => {
    return `The weather in ${location} is currently sunny with a temperature of 75°F.`;
  },
});

//calendar booking tool --> spawn cal.com atom for booking

//human handoff --> get user's email + phone number

//get service info --> vector rag service documents

export const getServiceInfo = tool({
  name: "getInfo",
  description:
    "When asked about any specific service, call this tool to get further information about it.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Generate best query to search for service information"),
  }),
  execute: async ({ query }) => {
    return `Information about ${query} service.`;
  },
});

export const tools: ToolSet = {
  getWooCommerceProducts,
  getWeather,
};
