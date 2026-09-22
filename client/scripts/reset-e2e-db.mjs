import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "../..");
const apiDir = resolve(root, "apis");
const config = JSON.parse(readFileSync(resolve(apiDir, "config.json"), "utf8"));
const db = config.database;

const targetDb = process.env.CATCHERY_E2E_DB || "catchery_e2e";

if (
  process.env.CATCHERY_E2E_RESET !== "YES" ||
  !/^[A-Za-z0-9_]+_e2e$/.test(targetDb) ||
  targetDb === db.name
) {
  throw new Error(
    `Refusing reset. Set CATCHERY_E2E_RESET=YES and CATCHERY_E2E_DB to a name matching ^[A-Za-z0-9_]+_e2e$ that differs from apis/config.json database.name (${db.name}). Target was: ${targetDb}`,
  );
}

const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("DATABASE_")));
Object.assign(env, {
  PGPASSWORD: db.password,
  DATABASE_USERNAME: db.username,
  DATABASE_PASSWORD: db.password,
  DATABASE_HOST: db.host,
  DATABASE_PORT: String(db.port),
  DATABASE_NAME: targetDb,
});

const psql = (dbName, args, options = {}) => {
  const result = spawnSync(
    "psql",
    ["-h", db.host, "-p", String(db.port), "-U", db.username, "-d", dbName, "-v", "ON_ERROR_STOP=1", ...args],
    { cwd: apiDir, env, ...options },
  );
  if (result.status !== 0) {
    if (result.stderr) console.error(result.stderr.toString());
    process.exit(result.status ?? 1);
  }
  return result;
};

// Terminate target DB connections, drop, and recreate target DB
const adminDb = "postgres";
psql(adminDb, ["-c", `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${targetDb}' AND pid <> pg_backend_pid();`]);
psql(adminDb, ["-c", `DROP DATABASE IF EXISTS ${targetDb};`]);
psql(adminDb, ["-c", `CREATE DATABASE ${targetDb};`]);

// Apply all migrations in lexical order
const migrationsDir = resolve(apiDir, "db/migrations");
const upMigrations = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".up.sql"))
  .sort();

for (const file of upMigrations) {
  psql(targetDb, ["-f", resolve(migrationsDir, file)], { stdio: "inherit" });
}

// Run seeds
psql(targetDb, ["-f", resolve(apiDir, "db/seed/01_reference_data.sql")], { stdio: "inherit" });
psql(targetDb, ["-f", resolve(apiDir, "db/seed/02_seasons.sql")], { stdio: "inherit" });

// Run Go seeder
const seed = spawnSync("go", ["run", "cmd/seed/main.go"], { cwd: apiDir, env, stdio: "inherit" });
if (seed.status !== 0) process.exit(seed.status ?? 1);

// Verify seed counts against target DB
const count = (table, where = "") =>
  psql(targetDb, ["-tAc", `SELECT COUNT(*) FROM ${table}${where};`], { encoding: "utf8" }).stdout.trim();

for (const [table, expected, where] of [
  ["workers", "8", ""],
  ["users", "5", ""],
  ["customers", "5", ""],
  ["bagang", "5", ""],
  ["harvests", "30", ""],
  ["production_costs", "25", ""],
  ["sales", "9", ""],
  ["harvest_types", "3", ""],
  ["production_costs_type", "6", ""],
  ["seasons", "1", " WHERE end_date IS NULL"],
]) {
  if (count(table, where) !== expected) throw new Error(`Seed verification failed: expected ${expected} ${table}${where}.`);
}
if (count("users", " WHERE id IN ('admin', 'owner1', 'owner2', 'worker1', 'worker2')") !== "5") {
  throw new Error("Seed verification failed: expected test accounts are missing.");
}
