import { Elysia } from "elysia";
import { cron, Patterns } from "@elysiajs/cron";
import { syncProducts } from "./utils/dbProductManager";

const productCron = new Elysia()
  .use(
    cron({
      name: "product-cron",
      pattern: Patterns.EVERY_DAY_AT_4AM,
      run: async () => {
        console.log("[CRON] Syncing products...");
        await syncProducts();
      },
    }),
  )
  .get("/force-cron", async () => {
    await syncProducts();
  });

export default productCron;
