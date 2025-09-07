//In this file we are going to upsert products into the vector database
// and manage updating old payloads based on the cron job updates
// all payloads should have matching ids with the product id in the sqlite database as well as
// generated product id based on woocommerce
//
// We will also have a collection here and have a function to update the document search as well
import client from "./client";
import createEmbedding from "./embedder";

type productPayload = {
  id: string;
  title: string;
  price: number;
  category: string;
};

export async function upsertProduct(
  payload: productPayload,
  embedding: number[],
) {
  await client.upsert("products", {
    points: [
      {
        id: payload.id,
        payload: {
          title: payload.title,
          price: payload.price,
          category: payload.category,
        },
        vector: embedding,
      },
    ],
  });
}

export async function searchDocuments(query: string, category: string) {
  const embeddedQuery = await createEmbedding(query);
  const response = await client.query("products", {
    query: embeddedQuery.embedding,
    filter: {
      must: [
        {
          key: "category",
          match: {
            value: category,
          },
        },
      ],
    },
    limit: 3,
  });
  return response;
}
