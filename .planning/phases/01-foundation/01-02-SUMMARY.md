---
plan: "01-02"
status: complete
completed: 2026-04-13
deviations: []
---

# Plan 01-02 Summary: Drizzle Schema, Neon Push, Redis, CI

## What Was Done

### Task 1-02-01 — Drizzle Schema (complete)
- `drizzle.config.ts` pointing to `src/lib/db/schema/index.ts`
- `src/lib/db/index.ts` — Neon HTTP client via `@neondatabase/serverless` + drizzle instance
- **9 domain schema files** in `src/lib/db/schema/`:
  - `enums.ts` — leadStatusEnum, leadSourceEnum, leadClassificationEnum, bookingStatusEnum, boatCategoryEnum, tripTypeEnum, postStatusEnum
  - `boats.ts` — boats table
  - `leads.ts` — leads table
  - `clients.ts` — clients table
  - `bookings.ts` — bookings table (FK → boats, leads)
  - `availability.ts` — boatAvailability table (FK → boats)
  - `activities.ts` — leadActivities table (FK → leads)
  - `marketing.ts` — marketingPosts table
  - `reviews.ts` — reviews table
  - `admin-users.ts` — adminUsers table
  - `index.ts` — barrel re-export (`export * from` all domain files)

### Task 1-02-02 — Upstash Redis (complete, credentials deferred)
- `src/lib/redis.ts` — `Redis.fromEnv()` client (reads UPSTASH_REDIS_REST_URL + TOKEN)
- `src/lib/ratelimit.ts` — slidingWindow ratelimiter
- `/api/redis-test` verification route added (temp)
- **Credentials deferred**: user decided Upstash setup is not required for Phase 1. Will wire up in Phase 3 when actual rate-limited routes are built.

### Task 1-02-03 — Sentry (deferred to post-Phase 1)
- `npx @sentry/wizard@latest -i nextjs` requires interactive TTY — deferred.
- `@sentry/nextjs` package is already in `package.json`.
- Run the wizard manually before Phase 2 deploy if error tracking is needed.

### [BLOCKING] drizzle-kit push — COMPLETE ✅
- Ran: `DATABASE_URL=<neon-url> npx drizzle-kit push`
- Output: `[✓] Changes applied`
- All 9 tables created in Neon PostgreSQL
- Database: `neondb` on `ep-spring-term-amprqmr6-pooler.c-5.us-east-1.aws.neon.tech`

### Task 1-02-04 — CI/CD (complete)
- `.github/workflows/ci.yml` — runs on push + PR to main
- Steps: `npm ci` → `npm run lint` → `npm run type-check`
- Satisfies INFRA-06

## Verification Results

| Check | Result |
|-------|--------|
| `drizzle-kit push` | ✅ `[✓] Changes applied` — all 9 tables in Neon |
| `npm run lint` | ✅ Clean |
| `npm run type-check` | ✅ Clean |
| Redis client | ⚠️ Deferred (no Upstash credentials yet) |
| Sentry wizard | ⚠️ Deferred (requires interactive TTY) |
| CI workflow | ✅ File committed, triggers on next push to main |
| Vercel deployment | ⚠️ Manual — requires Vercel project link + `git push` |

## Deviations

None from core schema/DB work. Two items deferred by user decision:
1. Upstash Redis credentials — deferred to Phase 3
2. Sentry wizard — deferred to pre-Phase 2 deploy

## Next Plan

Phase 1 is now functionally complete (INFRA-01 through INFRA-04, INFRA-06).
Remaining manual steps before Phase 2:
- `git push origin master` → triggers CI and Vercel deploy
- Run `npx @sentry/wizard@latest -i nextjs` when Sentry DSN is available

**Next phase: 02 — Landing Page**
