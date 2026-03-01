import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Database as SQLiteDatabase } from "better-sqlite3";
import BetterSQLite3 from "better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

type Schema = typeof schema;
let dbInstance: BetterSQLite3Database<Schema> | null = null;
let sqliteInstance: SQLiteDatabase | null = null;

const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-development-server";

function getDbPath(): string {
  return process.env.DATABASE_URL?.replace("file:", "") || "./linku.db";
}

function createDatabase(): { sqlite: SQLiteDatabase; db: BetterSQLite3Database<Schema> } {
  if (dbInstance && sqliteInstance) {
    return { sqlite: sqliteInstance, db: dbInstance };
  }

  const dbPath = getDbPath();

  // Ensure the directory exists for the database file
  const dbDir = dirname(dbPath);
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  sqliteInstance = new BetterSQLite3(dbPath);
  sqliteInstance.pragma("journal_mode = WAL");
  sqliteInstance.pragma("foreign_keys = ON");

  dbInstance = drizzle(sqliteInstance, { schema });

  // Run migrations only at runtime, not during build
  if (!isBuildPhase && !process.env.SKIP_DB_MIGRATIONS) {
    migrate(dbInstance, { migrationsFolder: "./drizzle" });
  }

  return { sqlite: sqliteInstance, db: dbInstance };
}

export function getDb(): BetterSQLite3Database<Schema> {
  return createDatabase().db;
}

export function getSqlite(): SQLiteDatabase {
  return createDatabase().sqlite;
}

// Backwards-compatible export - lazy proxy that creates DB on first access
// This prevents database connection during build time
export const db = new Proxy({} as BetterSQLite3Database<Schema>, {
  get<K extends keyof BetterSQLite3Database<Schema>>(
    _: BetterSQLite3Database<Schema>,
    prop: K,
  ): BetterSQLite3Database<Schema>[K] {
    const database = createDatabase().db;
    return database[prop];
  },
});

export type Database = BetterSQLite3Database<Schema>;
