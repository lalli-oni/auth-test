import { Database } from "bun:sqlite";
import { initializeSchema } from "./schema";

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    db = new Database("auth-test.db");
    db.run("PRAGMA foreign_keys = ON");
    initializeSchema(db);
  }
  return db;
}

export function resetDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }

  // Delete the database file
  const fs = require("fs");
  if (fs.existsSync("auth-test.db")) {
    fs.unlinkSync("auth-test.db");
  }

  // Reinitialize
  getDatabase();
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
