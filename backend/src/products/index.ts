import { Elysia } from "elysia";
import productCron from "./cron";

const productRouter = new Elysia({ prefix: "/products" })
  .get("/", () => "Hello Products")
  .use(productCron)
  .get("/products", async () => {
    //return await getProducts();
  });

export default productRouter;
