import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import productRouter from "./products";
import websocketRouter from "./websocket";
import calendarRouter from "./calendar";

const app = new Elysia({ prefix: "/api" })
  .use(swagger())
  .use(productRouter)
  .use(websocketRouter)
  .use(calendarRouter)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
