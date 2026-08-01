import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

let cachedDatabase: Database | null | undefined;

export function getDatabase(): Database | null {
  if (cachedDatabase !== undefined) return cachedDatabase;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    cachedDatabase = null;
    return cachedDatabase;
  }

  const client = neon(connectionString);
  cachedDatabase = drizzle({ client, schema });
  return cachedDatabase;
}
