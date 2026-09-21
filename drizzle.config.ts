import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside the app (CLI), so it reads .env directly rather
// than importing lib/db — same fallback order as the runtime client so
// `db:generate`/`db:migrate`/`db:studio` work against whatever the current
// shell has, whether that's .env.local or Vercel's pulled env
// (`vercel env pull`).
const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
});
