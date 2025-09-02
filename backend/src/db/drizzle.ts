import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("rp-assistant.db");
const db = drizzle({ client: sqlite });

const result = db.select();
