import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Vercel + Neon serverless pattern — deliberately NOT a connection pool.
 *
 * `neon-http` issues each query as a single stateless HTTPS fetch to Neon's
 * data API instead of holding a TCP/WebSocket connection open. That's what
 * makes it safe to call `neon()`/`drizzle()` at module scope in a Serverless
 * Function: there is no socket to leak between invocations, nothing to
 * `.end()`, and nothing that goes stale when a lambda freezes between
 * requests. Module-level caching here only reuses the lightweight JS client
 * object across warm invocations — it never keeps a database connection
 * open while idle.
 *
 * Multi-statement work still gets transactional guarantees: Drizzle's
 * neon-http driver implements `db.transaction()` as a single batched HTTP
 * call, so we don't need `@neondatabase/serverless`'s `Pool` + WebSockets
 * (which *would* need explicit lifecycle management) for anything this app
 * currently does.
 *
 * If a route ever needs a session-scoped `Pool` (e.g. `LISTEN/NOTIFY`, or
 * many sequential statements sharing one server-side transaction context),
 * open and `await pool.end()` it within that single request handler only —
 * never at module scope — so it can't outlive the invocation.
 */

// The Vercel Marketplace "Neon" integration provisions several variable
// names depending on how the project was connected. `DATABASE_URL` is the
// one we ask for in .env.example and Vercel project settings; the others
// are accepted as fallbacks so this also works out of the box against the
// full var set the integration writes (including its Prisma-flavored
// alias) without any extra configuration.
const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it in Vercel → Project → Settings → " +
      "Environment Variables (auto-populated per environment when the " +
      "Neon integration is connected), or in .env.local for local dev.",
  );
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
