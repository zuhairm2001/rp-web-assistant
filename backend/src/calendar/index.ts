import { Elysia } from "elysia";
import { de } from "zod/v4/locales/index.cjs";

const calendarRouter = new Elysia({
  name: "Calendar",
  prefix: "/calendar",
}).get("/refresh", () => "Hello, Calendar!");

export default calendarRouter;
