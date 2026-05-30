---
name: Session auth with connect-pg-simple + esbuild
description: How to make express-session + connect-pg-simple work after esbuild bundling in the Replit proxy environment
---

## The rule

Never use `createTableIfMissing: true` with `connect-pg-simple` when the server is bundled with esbuild. The `table.sql` file is NOT included in the bundle, causing a silent `ENOENT` error on every session operation.

**Why:** esbuild bundles JS but does not copy static asset files (`.sql`, etc.) from node_modules. `connect-pg-simple` reads `table.sql` at runtime from its own package directory, which no longer exists in `dist/`.

**How to apply:**
1. Create the session table manually before first run:
   ```sql
   CREATE TABLE IF NOT EXISTS "session" (
     "sid" varchar NOT NULL COLLATE "default",
     "sess" json NOT NULL,
     "expire" timestamp(6) NOT NULL,
     CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
   ) WITH (OIDS=FALSE);
   CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
   ```
2. Use `new PgStore({ pool })` — no `createTableIfMissing` option.
3. Add `app.set("trust proxy", 1)` so Express trusts `X-Forwarded-Proto: https` from the Replit proxy.
4. Cookie config for Replit proxy: `{ secure: true, httpOnly: true, sameSite: "none", maxAge: 86400000 }`.
5. Add `credentials: "include"` to the `customFetch` function so browsers send cookies cross-origin through the proxy.
6. Call `req.session.save(cb)` explicitly in the login handler before `res.json()` — ensures async write completes before the cookie is sent.
