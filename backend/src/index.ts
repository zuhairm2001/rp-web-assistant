import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia().use(swagger());

app.get("/", () => "Hello Elysia").listen(3000);
app.get("/products", async () => {
  return await api.get("products");
});
console.log(Bun.env.WOOCOMMERCE_API_KEY);
console.log(Bun.env.WOOCOMMERCE_API_SECRET);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
