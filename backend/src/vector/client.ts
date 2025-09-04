import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: Bun.env.QDRANT_URL,
});

export default client;
