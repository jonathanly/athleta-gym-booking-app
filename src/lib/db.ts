import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/schema";

// Construct the client only on the first database operation, never during next build.
function connect() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const client = postgres(process.env.DATABASE_URL, { max: 10 });
  return { client, db: drizzle(client, { schema }) };
}

const globalDb = globalThis as typeof globalThis & { athletaDatabase?: ReturnType<typeof connect> };

export function getDb() {
  globalDb.athletaDatabase ??= connect();
  return globalDb.athletaDatabase.db;
}

export async function closeDb() {
  if (globalDb.athletaDatabase) {
    await globalDb.athletaDatabase.client.end();
    delete globalDb.athletaDatabase;
  }
}

export type Database = ReturnType<typeof getDb>;
export type Reader = Pick<Database, "select">;
