import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "./linku.db";

// Ensure the directory exists for the database file
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrency
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Run migrations on startup
migrate(db, { migrationsFolder: "./drizzle" });

export type Database = typeof db;
