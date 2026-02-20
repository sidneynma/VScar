import fs from "fs";
import path from "path";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  const migrationsDir = path.join(__dirname);
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`[v0] Found ${files.length} migration files`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    try {
      console.log(`[v0] Running migration: ${file}`);
      await pool.query(sql);
      console.log(`[v0] ✓ Completed: ${file}`);
    } catch (error) {
      console.error(`[v0] ✗ Failed: ${file}`, error);
      throw error;
    }
  }

  console.log("[v0] All migrations completed successfully!");
  await pool.end();
}

runMigrations().catch((error) => {
  console.error("[v0] Migration failed:", error);
  process.exit(1);
});
