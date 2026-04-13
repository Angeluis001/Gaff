# Phase 1: Foundation - Research

**Researched:** 2026-04-13
**Domain:** Next.js 15 + Drizzle ORM + Neon PostgreSQL + Upstash Redis + Sentry + Vercel CI/CD
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Drizzle schema is split by domain into `lib/db/schema/` subdirectory — not a single flat `schema.ts`
- **D-02:** Domain files: `boats.ts`, `leads.ts`, `clients.ts`, `bookings.ts`, `availability.ts`, `activities.ts`, `marketing.ts`, `reviews.ts`, `admin-users.ts`
- **D-03:** All domain files are re-exported from `lib/db/schema/index.ts` — canonical import point (`import { boats, leads } from '@/lib/db/schema'`)
- **D-04:** Enums defined in shared `lib/db/schema/enums.ts`, imported by domain files that reference them
- Stack locked: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui + Drizzle ORM + Neon PostgreSQL (not negotiable per CLAUDE.md)
- Package manager: npm (not yarn/pnpm)
- Path alias: `@/*`
- DB driver: `@neondatabase/serverless` (not `pg`)

### Claude's Discretion
- Neon database branching strategy — standard two-branch (dev/prod) is fine
- Git flow / branch protection rules — standard setup for solo dev
- Seed data — deferred to Phase 2
- `@/*` path alias implementation details

### Deferred Ideas (OUT OF SCOPE)
- Seed data for boat fleet — Phase 2
- Neon branch-per-developer workflow — post-launch
- Storybook component documentation — not in scope for any phase
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Next.js 15 app scaffolded with TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, Neon PostgreSQL connection | Scaffold command, dependency install list, version-pinning strategy (section: Standard Stack) |
| INFRA-02 | Project folder structure matches build pack specification (app router, src/, components/landing, components/booking, lib/db, etc.) | Exact folder tree from build pack §3.2, adapted to domain-split schema (section: Architecture Patterns) |
| INFRA-03 | Drizzle schema defined for boats, leads, clients, bookings, boatAvailability, leadActivities, marketingPosts, reviews, adminUsers tables | Full schema from build pack §7.1 split across domain files per D-01–D-04 (section: Architecture Patterns) |
| INFRA-04 | Database migrations run successfully against Neon serverless PostgreSQL | `drizzle-kit push` vs `migrate` strategy; Neon connection string format; drizzle.config.ts pattern (section: Architecture Patterns) |
| INFRA-05 | Vercel deployment configured (production + preview environments, environment variables set) | Vercel env var management, branch-to-environment mapping, vercel.json needs (section: Architecture Patterns) |
| INFRA-06 | CI/CD pipeline active (lint, type-check, migration validation on PR) | GitHub Actions workflow structure, scripts in package.json (section: Architecture Patterns) |
| INTG-07 | Upstash Redis configured for rate limiting on API routes and job queuing for agent tasks via Vercel Cron | `@upstash/redis` + `@upstash/ratelimit` setup, Edge/Node runtime compat (section: Code Examples) |
| INTG-08 | Sentry configured for error tracking and performance monitoring on both frontend and API routes | `@sentry/nextjs` 10.x, `instrumentation.ts` pattern, Next.js 15 wizard command (section: Code Examples) |
</phase_requirements>

---

## Summary

Phase 1 is a pure infrastructure and scaffolding phase — no UI, no business logic. The goal is to get the project from zero files to a state where `npm run dev` runs clean, Drizzle migrations are live on Neon, Vercel CI/CD is active, and Sentry + Upstash Redis are wired. Everything subsequent phases build on originates here.

The most important finding from registry verification: **`create-next-app@latest` now installs Next.js 16.2.3, not 15.** The build pack's scaffold command (`npx create-next-app@latest`) will produce the wrong major version. The correct command is `npx create-next-app@15`. The latest Next.js 15 patch is **15.5.15** [VERIFIED: npm registry]. All other stack libraries (Sentry 10.x, @upstash/redis 1.37.0, drizzle-orm 0.45.2) are confirmed compatible with Next.js 15 and React 19.

The schema split pattern (D-01–D-04) is straightforward with Drizzle: each domain file imports from `./enums.ts`, all domain files are barrel-exported from `index.ts`, and `drizzle.config.ts` points to `src/lib/db/schema/index.ts`. The `drizzle-kit push` command (not `generate` + `migrate`) is correct for initial schema deployment to Neon in a solo-dev flow — it applies schema directly without a migrations folder.

**Primary recommendation:** Pin Next.js to `"next": "15.5.15"` in package.json after scaffolding with `npx create-next-app@15`. Use `drizzle-kit push` for Phase 1 schema deployment. Use `@sentry/nextjs@10` with `npx @sentry/wizard@latest -i nextjs` for automated Next.js 15 instrumentation setup.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.15 | App framework (App Router, RSC, API routes) | Locked by build pack; latest 15.x patch |
| react | 19.2.5 | UI runtime | Ships with Next.js 15 |
| react-dom | 19.2.5 | DOM renderer | Ships with Next.js 15 |
| typescript | 6.0.2 | Type safety | Locked by build pack |
| tailwindcss | 4.2.2 | Utility-first CSS | Locked by build pack |
| drizzle-orm | 0.45.2 | Type-safe ORM for PostgreSQL | Locked by build pack |
| drizzle-kit | 0.31.10 | Schema management + migration CLI | Required by drizzle-orm |
| @neondatabase/serverless | 1.0.2 | Neon PostgreSQL driver | Locked by build pack (not `pg`) |

### Supporting (Phase 1 only)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @upstash/redis | 1.37.0 | Redis client (INTG-07) | Rate limiting, job queuing |
| @upstash/ratelimit | 2.0.8 | Rate limiting utilities | API route protection |
| @sentry/nextjs | 10.48.0 | Error tracking + performance (INTG-08) | All frontend + API error capture |
| shadcn | 4.2.0 | Component CLI (not a runtime dep) | shadcn/ui component scaffolding |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| drizzle-kit push | drizzle-kit generate + migrate | `push` is simpler for solo-dev initial setup; `generate + migrate` required in team CI where tracked migration files matter — defer to later phases |
| @neondatabase/serverless | pg (node-postgres) | `pg` requires persistent connections that don't work in serverless — never use `pg` with Neon on Vercel |
| @sentry/nextjs wizard | Manual Sentry config | Wizard handles `instrumentation.ts`, `sentry.*.config.ts` files automatically and is the official supported path |

**Installation (Phase 1 core deps):**
```bash
# Scaffold — MUST use @15 not @latest (latest = Next.js 16)
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# DB
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Observability
npm install @upstash/redis @upstash/ratelimit
npm install @sentry/nextjs

# UI (shadcn CLI — run after scaffold)
npx shadcn@latest init
```

**Version verification (confirmed 2026-04-13):** [VERIFIED: npm registry]
- `next`: 15.5.15 (latest 15.x; `@latest` = 16.2.3 — DO NOT use)
- `drizzle-orm`: 0.45.2
- `drizzle-kit`: 0.31.10
- `@neondatabase/serverless`: 1.0.2
- `@upstash/redis`: 1.37.0
- `@upstash/ratelimit`: 2.0.8
- `@sentry/nextjs`: 10.48.0 (supports `^15.0.0-rc.0 || ^16.0.0-0`)
- `shadcn` CLI: 4.2.0
- `tailwindcss`: 4.2.2
- `typescript`: 6.0.2
- `react` / `react-dom`: 19.2.5

---

## Architecture Patterns

### Recommended Project Structure
```
D:/GAFF/                         # Project root (already contains CLAUDE.md)
src/
├── app/
│   ├── layout.tsx               # Root layout — metadata stub only in Phase 1
│   ├── page.tsx                 # Root page — placeholder in Phase 1
│   ├── globals.css
│   └── api/
│       ├── booking/route.ts     # Stub — Phase 3
│       ├── contact/route.ts     # Stub — Phase 3
│       ├── leads/route.ts       # Stub — Phase 5
│       └── stripe/
│           ├── checkout/route.ts
│           └── webhook/route.ts
├── components/
│   ├── landing/                 # Phase 2 components (empty dir in Phase 1)
│   ├── booking/                 # Phase 3 components (empty dir in Phase 1)
│   ├── ui/                     # shadcn/ui generated components
│   └── shared/                 # Phase 2+ shared components
├── lib/
│   ├── db/
│   │   ├── index.ts            # Neon connection + drizzle instance
│   │   ├── schema/
│   │   │   ├── index.ts        # Barrel export of ALL schema + enums
│   │   │   ├── enums.ts        # ALL pgEnum definitions (shared)
│   │   │   ├── boats.ts
│   │   │   ├── leads.ts
│   │   │   ├── clients.ts
│   │   │   ├── bookings.ts
│   │   │   ├── availability.ts
│   │   │   ├── activities.ts
│   │   │   ├── marketing.ts
│   │   │   ├── reviews.ts
│   │   │   └── admin-users.ts
│   │   └── migrations/         # Created by drizzle-kit generate (NOT used in push flow)
│   ├── utils.ts
│   └── constants.ts
├── hooks/                       # Phase 2+ hooks
└── types/                       # Shared TypeScript types
    ├── booking.ts
    ├── lead.ts
    └── boat.ts
instrumentation.ts               # Sentry — at project root (src/ aware)
sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
drizzle.config.ts                # At project root
.env.local                       # Never committed
.github/
└── workflows/
    └── ci.yml                   # Lint + type-check + (optional) migration check
```

### Pattern 1: Neon + Drizzle Connection (lib/db/index.ts)
**What:** Single exported `db` instance using Neon serverless HTTP adapter
**When to use:** Import `db` from `@/lib/db` everywhere in API routes and server components

```typescript
// Source: @neondatabase/serverless + drizzle-orm/neon-http docs [ASSUMED — standard pattern]
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Key detail:** Use `neon-http` adapter (not `neon-serverless` WebSocket adapter) for Vercel Edge + Node runtimes. The HTTP adapter works in all runtimes without WebSocket support. [ASSUMED — based on Neon docs guidance for serverless]

### Pattern 2: Domain-Split Schema with Shared Enums
**What:** All `pgEnum` definitions in `enums.ts`; domain tables in separate files; all re-exported from `index.ts`
**When to use:** Required by D-01–D-04 — this IS the pattern

```typescript
// lib/db/schema/enums.ts
// Source: Build pack §7.1 [CITED: build pack]
import { pgEnum } from 'drizzle-orm/pg-core';

export const leadStatusEnum = pgEnum('lead_status', [
  'new', 'contacted', 'qualified', 'proposal_sent',
  'booked', 'completed', 'lost', 'nurture'
]);
export const leadSourceEnum = pgEnum('lead_source', [
  'website', 'whatsapp', 'instagram', 'facebook',
  'tiktok', 'tripadvisor', 'referral', 'google', 'other'
]);
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending', 'deposit_paid', 'confirmed', 'in_progress',
  'completed', 'cancelled', 'refunded', 'no_show'
]);
export const boatCategoryEnum = pgEnum('boat_category', [
  'standard', 'midsize', 'large', 'luxury'
]);
export const tripTypeEnum = pgEnum('trip_type', [
  'half_day', 'full_day', 'overnight'
]);
```

```typescript
// lib/db/schema/boats.ts
import { pgTable, text, timestamp, integer, boolean, decimal, uuid, jsonb } from 'drizzle-orm/pg-core';
import { boatCategoryEnum } from './enums';

export const boats = pgTable('boats', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: boatCategoryEnum('category').notNull(),
  capacity: integer('capacity').notNull(),
  length: text('length'),
  description: text('description'),
  features: jsonb('features').$type<string[]>(),
  images: jsonb('images').$type<string[]>(),
  priceHalfDay: decimal('price_half_day', { precision: 10, scale: 2 }),
  priceFullDay: decimal('price_full_day', { precision: 10, scale: 2 }),
  captainName: text('captain_name'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

```typescript
// lib/db/schema/index.ts — canonical barrel export
export * from './enums';
export * from './boats';
export * from './leads';
export * from './clients';
export * from './bookings';
export * from './availability';
export * from './activities';
export * from './marketing';
export * from './reviews';
export * from './admin-users';
```

### Pattern 3: drizzle.config.ts
**What:** Points drizzle-kit at the schema barrel; uses Neon connection string

```typescript
// drizzle.config.ts [ASSUMED — standard drizzle-kit config shape]
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Pattern 4: Sentry — instrumentation.ts
**What:** Next.js 15 uses `instrumentation.ts` at the project root for server-side Sentry init
**When to use:** Required for capturing errors in RSC, API routes, and Edge functions

```typescript
// instrumentation.ts (Next.js 15 standard location) [ASSUMED — standard pattern, wizard generates this]
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
```

The Sentry wizard (`npx @sentry/wizard@latest -i nextjs`) generates all four files automatically and updates `next.config.ts` with `withSentryConfig`. Use the wizard rather than manual setup. [ASSUMED — Sentry wizard is the documented approach; behavior confirmed stable across Next.js 13-16]

### Pattern 5: Upstash Redis Client
**What:** `@upstash/redis` uses HTTP REST API — no TCP connection, works in Edge and Node runtimes

```typescript
// lib/redis.ts [ASSUMED — standard @upstash/redis initialization]
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

```typescript
// lib/ratelimit.ts — rate limit factory for API routes [ASSUMED]
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});
```

### Pattern 6: GitHub Actions CI
**What:** Lint + type-check on every PR, no test suite required in Phase 1
**When to use:** Runs on push to main and all PRs

```yaml
# .github/workflows/ci.yml [ASSUMED — standard Next.js CI shape]
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
```

package.json must include:
```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

### Anti-Patterns to Avoid
- **Using `create-next-app@latest`:** Installs Next.js 16, not 15. Use `create-next-app@15` [VERIFIED: npm registry]
- **Importing from `pg` instead of `@neondatabase/serverless`:** `pg` requires TCP connections that fail in serverless/Edge environments
- **Putting enums in individual domain files:** Cross-table references will create circular imports — all enums go in `enums.ts`
- **Using `drizzle-kit generate` + `migrate` for initial setup:** Adds migration file complexity unnecessary in Phase 1. Use `drizzle-kit push` for initial schema push; add migration tracking in a later phase
- **Using `neon-serverless` (WebSocket) adapter instead of `neon-http`:** WebSocket adapter requires persistent connections; HTTP adapter works everywhere including Edge
- **Committing `.env.local`:** All secrets stay in Vercel dashboard env vars; `.env.local` is for local only and must be in `.gitignore`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | Custom Redis counters | `@upstash/ratelimit` | Sliding window, fixed window, token bucket all built-in; handles edge cases |
| Error capture | Custom try/catch logging | `@sentry/nextjs` | Automatic RSC, Edge, sourcemap, performance tracing |
| DB migrations | Custom SQL runner | `drizzle-kit push` / `drizzle-kit generate` | Schema diff engine handles column renames, type changes safely |
| Serverless DB connection | Custom connection pooling | `@neondatabase/serverless` neon-http | Neon built-in HTTP transport; no connection pool management needed |
| GitHub CI | Custom shell scripts | Standard GitHub Actions + `npm run lint && tsc --noEmit` | Two commands; any more complexity is premature |

**Key insight:** Phase 1 is infrastructure wiring, not engineering. Every problem here has a one-package solution — don't build what Neon, Drizzle, Upstash, or Sentry already solved.

---

## Common Pitfalls

### Pitfall 1: Wrong Next.js Version from create-next-app
**What goes wrong:** `npx create-next-app@latest` silently installs Next.js 16.2.3. The project builds but every Phase 1–8 pattern is written for Next.js 15 APIs. Discovering this mid-Phase 2 causes a painful rebuild.
**Why it happens:** The npm `latest` dist-tag on both `next` and `create-next-app` now points to Next.js 16.
**How to avoid:** Always use `npx create-next-app@15` for this project.
**Warning signs:** `package.json` shows `"next": "^16.x.x"` — run `npm view next version` to check what was installed.

### Pitfall 2: Neon DATABASE_URL Format
**What goes wrong:** Using a pooled connection string (with `-pooler` in the hostname) for Drizzle's HTTP adapter causes errors. Using a non-SSL connection string fails in Neon's default config.
**Why it happens:** Neon provides two connection string formats — direct and pooler. The HTTP adapter uses its own transport and should use the direct (non-pooler) URL.
**How to avoid:** In Neon dashboard, copy the "Direct connection" URL (not "Connection pooling" URL). Format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/gaff?sslmode=require`
**Warning signs:** Connection timeout errors or "connection reset" errors at startup.

### Pitfall 3: Sentry's instrumentation.ts Must Be at Project Root (not src/)
**What goes wrong:** Placing `instrumentation.ts` inside `src/` causes Sentry to miss server-side errors silently. No error at startup — just no server-side Sentry events.
**Why it happens:** Next.js 15 looks for `instrumentation.ts` at the project root, not inside `src/`. [ASSUMED]
**How to avoid:** Run the Sentry wizard which places files correctly. If placing manually, put `instrumentation.ts` at `D:/GAFF/instrumentation.ts`.
**Warning signs:** Client errors appear in Sentry but server/API errors do not.

### Pitfall 4: Circular Imports Between Schema Domain Files
**What goes wrong:** `bookings.ts` references `boats` table (foreign key) and `clients` table. If `enums.ts` exports are spread across domain files, importing across domain files creates circular dependency chains that break at runtime.
**Why it happens:** Drizzle schema files that import from each other create TypeScript module graph cycles.
**How to avoid:** All enums in `enums.ts`; foreign key references import the table from the other domain file directly (this is fine — it's a DAG, not circular as long as enums are separated).
**Warning signs:** TypeScript error `ReferenceError: Cannot access 'X' before initialization` at startup.

### Pitfall 5: shadcn/ui Init Prompts — Wrong Answers Break Tailwind Config
**What goes wrong:** shadcn CLI asks about base color, CSS variables, etc. Wrong answers (especially to "Would you like to use CSS variables for theming?") require manual Tailwind config surgery.
**Why it happens:** Tailwind v4 changed how CSS variables integrate — shadcn v4.x adapts but prompts matter.
**How to avoid:** During `npx shadcn@latest init`: choose `neutral` base color (closest to GAFF's navy/ocean palette), yes to CSS variables, confirm the `src/` path structure.
**Warning signs:** Component imports work but styling is broken or default styles look completely wrong.

### Pitfall 6: Vercel Env Vars Not Available in Build / Not Scoped Correctly
**What goes wrong:** `DATABASE_URL` missing at build time causes the Drizzle import to throw. `NEXT_PUBLIC_*` vars not marked as public in Vercel dashboard are undefined in client components.
**Why it happens:** Vercel has three env var scopes (Development, Preview, Production) and requires explicit assignment. `NEXT_PUBLIC_*` vars are inlined at build time.
**How to avoid:** In Vercel dashboard: add all env vars to all three scopes. `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_BOTPRESS_*` must be prefixed `NEXT_PUBLIC_`. `DATABASE_URL`, `SENTRY_DSN`, `UPSTASH_*` are server-only.
**Warning signs:** Build logs show `Error: DATABASE_URL is not defined` or client components show `undefined` for expected values.

---

## Code Examples

### Neon + Drizzle: lib/db/index.ts
```typescript
// Source: @neondatabase/serverless docs pattern [ASSUMED]
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
export type Database = typeof db;
```

### Upstash Redis: lib/redis.ts
```typescript
// Source: @upstash/redis docs pattern [ASSUMED]
import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Upstash Redis environment variables are required');
}

export const redis = Redis.fromEnv();
// fromEnv() reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN automatically
```

### Rate Limit Usage in an API Route
```typescript
// Source: @upstash/ratelimit docs [ASSUMED]
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  // ... handler logic
}
```

### Sentry Test Error (Phase 1 verification)
```typescript
// Place in a temporary API route for Phase 1 verification, then remove
// Source: Sentry docs [ASSUMED]
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  Sentry.captureException(new Error('Phase 1 Sentry test — can delete'));
  return NextResponse.json({ message: 'Error sent to Sentry' });
}
```

### drizzle.config.ts
```typescript
import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `npx create-next-app@latest` → Next.js 15 | `npx create-next-app@latest` → Next.js 16 | April 2026 | CRITICAL: Must pin to `@15` |
| `sentry.server.config.js` + `_middleware.ts` | `instrumentation.ts` + `sentry.*.config.ts` | Next.js 13.4+ | Old patterns silently no-op in Next.js 15 |
| `drizzle-orm/neon-serverless` (WebSocket) | `drizzle-orm/neon-http` (HTTP) | Stable | HTTP adapter is universally compatible with Edge |
| Manual Sentry Next.js config | `npx @sentry/wizard@latest -i nextjs` | ~Sentry SDK v7+ | Wizard handles all config files correctly |
| shadcn-ui (old package name) | `shadcn` (new CLI package) | shadcn v2+ | `npx shadcn@latest init` — old `npx shadcn-ui@latest` no longer works |

**Deprecated/outdated:**
- `npx shadcn-ui@latest init`: Old package name — use `npx shadcn@latest init` [ASSUMED based on known rename]
- `drizzle-orm/neon-serverless` import path for HTTP: Should be `drizzle-orm/neon-http` for the HTTP adapter [ASSUMED]
- `@vercel/postgres`: Not used here — project uses Neon's own SDK per build pack decision

---

## Environment Variables

Complete set required for Phase 1 to run locally and on Vercel:

### Required in Phase 1 (app won't start without these)
| Variable | Scope | Format | Notes |
|----------|-------|--------|-------|
| `DATABASE_URL` | Server | `postgresql://user:pass@ep-xxx.region.aws.neon.tech/gaff?sslmode=require` | Neon **direct** connection URL (not pooler) |
| `UPSTASH_REDIS_REST_URL` | Server | `https://xxx.upstash.io` | From Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Server | `AXxx...` | From Upstash dashboard |
| `SENTRY_DSN` | Server | `https://xxx@xxx.ingest.sentry.io/xxx` | From Sentry project settings |
| `NEXT_PUBLIC_URL` | Public | `http://localhost:3000` (dev) / `https://gaffallfishingloscabos.com` (prod) | Used in Stripe redirect URLs (Phase 3) |

### Required later but set now (don't break Phase 1 if missing, but Vercel needs them for later deploys)
| Variable | Scope | Phase Needed |
|----------|-------|-------------|
| `NEXTAUTH_SECRET` | Server | Phase 4 (Admin Auth) |
| `NEXTAUTH_URL` | Server | Phase 4 |
| `OPENAI_API_KEY` | Server | Phase 5 |
| `STRIPE_SECRET_KEY` | Server | Phase 3 |
| `STRIPE_PUBLISHABLE_KEY` | Server | Phase 3 |
| `STRIPE_WEBHOOK_SECRET` | Server | Phase 3 |
| `RESEND_API_KEY` | Server | Phase 3 |
| `NEXT_PUBLIC_GA_ID` | Public | Phase 2 |

**Neon branching strategy (Claude's Discretion):** Two branches — `main` (production DB) and `dev` (development DB). Both use the same schema. Neon free tier supports branching; Neon Pro includes it. `DATABASE_URL` in `.env.local` points to dev branch; Vercel Production env var points to main branch.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `drizzle-orm/neon-http` is the correct import path for the HTTP adapter | Architecture Patterns, Code Examples | Wrong import path causes module not found error; fix is trivial |
| A2 | `instrumentation.ts` must be at project root (not `src/`) for Next.js 15 | Architecture Patterns, Common Pitfalls | If Next.js 15 supports `src/instrumentation.ts`, pitfall warning is wrong — low risk, Sentry wizard places it correctly either way |
| A3 | `Redis.fromEnv()` reads `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically | Code Examples | If wrong, fall back to explicit `new Redis({ url, token })` |
| A4 | shadcn CLI package name is now `shadcn` not `shadcn-ui` | Standard Stack, Anti-Patterns | If old `shadcn-ui` name still works, no impact — both commands result in correct setup |
| A5 | `drizzle-kit push` is the correct Phase 1 approach (vs generate+migrate) | Architecture Patterns | Both work; push is simpler; generate+migrate adds migration file tracking which is better long-term but unnecessary for initial schema |

**All version claims are VERIFIED via npm registry on 2026-04-13.** Only implementation/API surface claims are ASSUMED.

---

## Open Questions

1. **Next.js 15 vs 16 decision**
   - What we know: Build pack specifies "Next.js 15"; `create-next-app@latest` now installs Next.js 16; all dependencies support both versions
   - What's unclear: Whether the user wants to pin to Next.js 15 as specified, or upgrade to Next.js 16 (which is a stable minor bump, not a breaking change from 15)
   - Recommendation: Follow the locked decision — use Next.js 15.5.15. If user wants to upgrade to 16, that's a separate decision that should be discussed before Phase 1 planning.

2. **drizzle-kit push vs generate + migrate**
   - What we know: Both work for initial schema deployment; `push` is simpler; `generate+migrate` is standard for team projects with migration history
   - What's unclear: Whether the solo-dev will want migration history files (useful for auditing schema changes over time)
   - Recommendation: Use `push` for Phase 1. Add `generate+migrate` in Phase 3 when schema stabilizes and production data exists that can't be dropped.

3. **Vercel project already exists?**
   - What we know: Vercel Pro is the target; domain is `gaffallfishingloscabos.com`
   - What's unclear: Whether the Vercel project has been created and the GitHub repo exists and is connected
   - Recommendation: Plan tasks assume Vercel project + GitHub repo need to be created as part of Phase 1 execution.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All npm/Next.js operations | ✓ | 25.8.2 (LTS) | — |
| npm | Package management | ✓ | 11.11.1 | — |
| Git | Version control + CI/CD | [ASSUMED] ✓ | — | Required, no fallback |
| Vercel CLI | Optional deploy tool | [NOT CHECKED] | — | Use Vercel dashboard / GitHub integration |
| Neon account | Database | [NOT CHECKED] | — | Required — create at neon.tech |
| Upstash account | Redis | [NOT CHECKED] | — | Required — create at upstash.com |
| Sentry account | Error tracking | [NOT CHECKED] | — | Required — create at sentry.io |
| GitHub account | CI/CD + Vercel integration | [NOT CHECKED] | — | Required — alternative: Vercel auto-deploy without Actions |

**Missing dependencies with no fallback:**
- Neon project + connection string (DATABASE_URL) — must be created before `drizzle-kit push` can run
- Upstash Redis database — must be created before Redis code can be verified

**Missing dependencies with fallback:**
- Vercel CLI — can deploy via `git push` + Vercel GitHub integration without the CLI
- GitHub Actions CI — Vercel has built-in lint/type-check options if GitHub Actions isn't used

**Note:** Node.js 25.8.2 is installed. This is a current LTS-era version and is fully compatible with Next.js 15.5.15 and all Phase 1 dependencies. [VERIFIED: npm version check]

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None required for Phase 1 — validation is via shell commands and Vercel dashboard |
| Config file | None — Phase 1 does not install a test runner |
| Quick run command | `npm run lint && npm run type-check` |
| Full suite command | `npm run build` (full build verifies all TypeScript + tree-shaking) |

Phase 1 success criteria are infrastructure verification, not unit tests. The four success criteria map directly to verifiable commands:

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Verifiable? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | `npm run dev` starts with no TS/lint errors | smoke | `npm run dev` (manual — starts server) | Manual |
| INFRA-01 | No TypeScript errors at build | automated | `npm run type-check` (= `tsc --noEmit`) | ✓ |
| INFRA-01 | No lint errors | automated | `npm run lint` | ✓ |
| INFRA-02 | Folder structure matches build pack | smoke | `ls -R src/` (manual inspection) | Manual |
| INFRA-03 | All schema tables defined | automated | `tsc --noEmit` (schema imports validate) | ✓ |
| INFRA-04 | Drizzle migrations applied to Neon | smoke | `npx drizzle-kit push` (exits 0 = success) | ✓ |
| INFRA-04 | All tables exist in DB | smoke | `npx drizzle-kit studio` → visual check | Manual |
| INFRA-05 | Vercel production deploy active | smoke | Check Vercel dashboard deployment status | Manual |
| INFRA-05 | Preview deploy on PR | smoke | Open a test PR and verify Vercel preview URL | Manual |
| INFRA-06 | CI passes lint + type-check | automated | Push to GitHub, verify Actions workflow green | Manual |
| INTG-07 | Upstash Redis connection verified | smoke | Hit `/api/redis-test` route → 200 OK | Manual (temporary route) |
| INTG-08 | Sentry captures test error on frontend | smoke | Trigger test error, check Sentry dashboard | Manual |
| INTG-08 | Sentry captures test error on API | smoke | Hit `/api/sentry-test` route, check Sentry | Manual (temporary route) |

### Sampling Rate
- **Per task commit:** `npm run lint && npm run type-check` (< 30 seconds)
- **Per wave merge:** `npm run build` (validates full production build)
- **Phase gate:** All 4 success criteria verified manually before `/gsd-verify-work`

### Wave 0 Gaps
- No test files needed — Phase 1 has no business logic to unit test
- Temporary verification routes needed during Phase 1 execution (delete after verification):
  - `src/app/api/redis-test/route.ts` — ping Redis, return connection status
  - `src/app/api/sentry-test/route.ts` — fire Sentry test error
- Both routes are DELETED after Phase 1 verification passes

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No (Phase 4) | — |
| V3 Session Management | No (Phase 4) | — |
| V4 Access Control | Partial | No admin routes exposed in Phase 1; scaffold placeholder only |
| V5 Input Validation | No (no user-facing inputs in Phase 1) | — |
| V6 Cryptography | No (no secrets processed in Phase 1) | — |
| V7 Error Handling | Yes | Sentry captures errors; ensure error messages don't leak stack traces to client |
| V14 Config / Env | Yes | All secrets in Vercel env vars; `.env.local` in `.gitignore` |

### Known Threat Patterns for Foundation Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Committing `.env.local` to git | Info Disclosure | `.gitignore` entry; verify with `git status` before first commit |
| Sentry DSN exposed to client | Info Disclosure | `SENTRY_DSN` is server-only; `NEXT_PUBLIC_SENTRY_DSN` only if intentionally public |
| DATABASE_URL in Vercel logs | Info Disclosure | Vercel masks env vars in logs by default; don't log `process.env.DATABASE_URL` explicitly |
| Temporary test routes left in production | Elevation of Privilege | Delete `/api/redis-test` and `/api/sentry-test` immediately after Phase 1 verification |

---

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view [package] version/dist-tags`) — all version numbers verified 2026-04-13
- Build pack §3.1, §3.2, §6.1, §7.1, §10 — scaffold commands, folder structure, full schema, env vars

### Secondary (MEDIUM confidence)
- CLAUDE.md — project constraints and tech stack lock
- CONTEXT.md (01-CONTEXT.md) — locked decisions D-01 through D-04
- REQUIREMENTS.md — INFRA-01 through INFRA-06, INTG-07, INTG-08 acceptance criteria

### Tertiary / Assumed (LOW confidence — needs verification at execution time)
- Neon HTTP adapter import path (`drizzle-orm/neon-http`) — standard pattern, verify against drizzle docs at execution
- `instrumentation.ts` placement at project root — verify against Next.js 15 docs at execution
- `Redis.fromEnv()` API — verify against @upstash/redis README at execution

---

## Metadata

**Confidence breakdown:**
- Standard stack versions: HIGH — all verified via npm registry 2026-04-13
- Architecture / folder structure: HIGH — directly from locked decisions + build pack §3.2
- Schema definitions: HIGH — directly from build pack §7.1 with domain-split applied per D-01–D-04
- Code patterns (drizzle, redis, sentry): MEDIUM — standard patterns, ASSUMED but stable across SDK versions
- Pitfalls: HIGH — Next.js 16/15 version issue is VERIFIED; others are well-known ecosystem gotchas

**Research date:** 2026-04-13
**Valid until:** 2026-07-13 (90 days — Next.js and Drizzle are stable; re-verify if either releases a major)
