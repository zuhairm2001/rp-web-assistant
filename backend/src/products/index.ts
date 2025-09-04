import { Elysia } from "elysia";

const productRouter = new Elysia({ prefix: "/products" })
  .get("/", () => "Hello Products")
  .get("/products", async () => {
    //return await getProducts();
  });

export default productRouter;
