import z from "zod";
import { tool } from "ai";

export const getWooCommerceProducts = tool({
  name: "getWooCommerceProducts",
  description: "Get WooCommerce products link and information",
  inputSchema: z.object({
    name: z.string().describe("The name of the product"),
  }),
  execute: async ({ name }) => {
    return `https://example.com/products/${name}`;
  },
});

//calendar booking tool --> spawn cal.com atom for booking

//human handoff --> get user's email + phone number

//get service info --> vector rag service documents
