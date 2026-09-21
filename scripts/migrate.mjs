#!/usr/bin/env node
// Runs as the "prebuild" npm lifecycle hook, so it fires automatically
// before every `next build` — including on Vercel, for Production AND for
// each Preview Deployment's ephemeral Neon branch. That's what actually
// gets a PR's schema changes applied to its own preview branch before the
// app boots against it, instead of the branch just carrying the
// parent's copy-on-write snapshot.
//
// Local `npm run build` without a database configured should not be
// blocked by this (there's nothing to migrate against), so a missing
// DATABASE_URL is a warning + no-op, not a failure. Once DATABASE_URL *is*
// set — which on Vercel it always is when the Neon integration is
// connected — a migration failure fails the build loudly, which is what we
// want: better a blocked deploy than an app running against a schema it
// doesn't match.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const migrationsDir = path.join(root, "lib", "db", "migrations");

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  console.warn(
    "[migrate] No DATABASE_URL in the environment — skipping drizzle-kit migrate.\n" +
      "[migrate] Set DATABASE_URL (Vercel: connect the Neon integration; local: .env.local) to apply migrations on build.",
  );
  process.exit(0);
}

const hasMigrations =
  existsSync(migrationsDir) &&
  readdirSync(migrationsDir).some((f) => f.endsWith(".sql"));

if (!hasMigrations) {
  console.warn(
    `[migrate] No .sql files in ${migrationsDir} yet — skipping. Run "npm run db:generate" after changing lib/db/schema.ts.`,
  );
  process.exit(0);
}

console.log("[migrate] Applying pending Drizzle migrations...");
const result = spawnSync("npx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});

if (result.status !== 0) {
  console.error("[migrate] drizzle-kit migrate failed — aborting build.");
  process.exit(result.status ?? 1);
}

console.log("[migrate] Migrations applied.");
