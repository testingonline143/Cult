import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn("\n[db] DATABASE_URL is not set — the server will run in Mock Mode for local/demo testing.");
}

// Only initialize the pool if we have a database URL
export const pool = new pg.Pool(
  dbUrl 
    ? { connectionString: dbUrl, connectionTimeoutMillis: 5000 }
    : { connectionString: "postgresql://no-db-url:5432/mock", connectionTimeoutMillis: 1 }
);

pool.on('error', (err) => {
  // Gracefully handle connection errors in environments without DB
  if (!dbUrl) return;
  console.error('[db] Unexpected error on idle client:', err.message);
});

export const db = drizzle(pool, { schema });
