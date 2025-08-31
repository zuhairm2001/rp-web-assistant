import { Hono } from "hono";
import { generateText } from "ai";
import createLLMS from "../utils/llms";
import ky from "ky";
import { createBasicAuthHeader } from "../utils/base64";
import { Product, type ProductSchema } from "../types/product";

type Bindings = {
  GATEWAY_API_KEY: string;
  WOOCOMMERCE_API_KEY: string;
  WOOCOMMERCE_API_SECRET: string;
};

const API_BASE_URL = "https://riskprofs.com/wp-json/wc/v3";
const chat = new Hono<{ Bindings: Bindings }>();

chat.get("/", async (c) => {
  const { deepseek } = createLLMS(c.env.GATEWAY_API_KEY);
  const response = await generateText({
    model: deepseek,
    prompt: "Hello, how can i assist you",
  });
  return c.text(response.text);
});

chat.get("/products", async (c) => {
  const result: ProductSchema = await Product.parseAsync(
    await ky
      .get(`${API_BASE_URL}/products`, {
        headers: {
          Authorization: createBasicAuthHeader(
            c.env.WOOCOMMERCE_API_KEY,
            c.env.WOOCOMMERCE_API_SECRET,
          ),
        },
      })
      .json(),
  );
  return c.json(result);
});

export default chat;
