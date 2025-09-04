import { fetch } from "bun";
import { ProductArray } from "../types/product";

const BASEURL = `https://riskprofs.com/wp-json/wc/v3`;
const KEY = Bun.env.WOOCOMMERCE_API_KEY;
const SECRET = Bun.env.WOOCOMMERCE_API_SECRET;

export const getProducts = async () => {
  const response = await fetch(`${BASEURL}/products`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${KEY}:${SECRET}`).toString("base64")}`,
    },
  });
  return response.json();
};

console.log(await ProductArray.parseAsync(await getProducts()));
