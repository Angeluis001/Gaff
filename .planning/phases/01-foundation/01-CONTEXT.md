# Phase 1: Foundation - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the Next.js 15 app with the full folder structure per the build pack, wire Neon PostgreSQL via Drizzle ORM with schema split by domain, configure Vercel deployment with CI/CD (lint + type-check), and instrument Upstash Redis and Sentry for observability. This is the base all subsequent phases build on — no UI components, no business logic, no agents.

</domain>

<decisions>
## Implementation Decisions

### Schema organization
- **D-01:** Drizzle schema is split by domain into `lib/db/schema/` subdirectory — not a single flat `schema.ts`
- **D-02:** Domain files: `boats.ts`, `leads.ts`, `clients.ts`, `bookings.ts`, `availability.ts`, `activities.ts`, `marketing.ts`, `reviews.ts`, `admin-users.ts`
- **D-03:** All domain files are re-exported from `lib/db/schema/index.ts` — this becomes the canonical import point (e.g., `import { boats, leads } from '@/lib/db/schema'`)
- **D-04:** Enums (`leadStatusEnum`, `bookingStatusEnum`, etc.) are defined in a shared `lib/db/schema/enums.ts` and imported by domain files that reference them

### Claude's Discretion
- Neon database branching strategy (dev/prod or dev/staging/prod) — standard two-branch setup is fine
- Git flow / branch protection rules — standard setup for solo dev
- Seed data — defer to Phase 2 when the Landing Page needs boats to render
- Path aliases — use `@/*` as specified in build pack
- Package manager — npm as specified in build pack commands

</decisions>

<specifics>
## Specific Ideas

- The build pack specifies the exact folder structure (`src/app/`, `src/components/landing/`, `src/lib/db/`, etc.) — follow it precisely. Do not deviate from the structure.
- The build pack shows the complete Drizzle schema (all tables, all enums) in one block in `lib/db/schema.ts` — use that as the source of truth for table definitions, but split into domain files per D-01 above.
- `@neondatabase/serverless` is the DB driver (not `pg`) — use the serverless adapter as specified.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project spec & stack decisions
- `.planning/PROJECT.md` — Core constraints (stack, hosting, budget), key decisions (Neon, Drizzle, Vercel Cron/Upstash)
- `.planning/REQUIREMENTS.md` — INFRA-01 through INFRA-06, INTG-07, INTG-08 — exact acceptance criteria for this phase
- `.planning/ROADMAP.md` — Phase 1 success criteria (all 4 conditions must be true)

### Build pack (authoritative implementation spec)
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` §3.1 — Exact npm install commands, scaffold command, all dependencies
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` §3.2 — Exact folder structure to replicate
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` §7.1 — Complete Drizzle schema (all tables, enums, types) — use as reference for domain split
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` §6.1 — Infrastructure overview (Vercel, Neon, Upstash tiers)
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` §10 — All environment variables required (DATABASE_URL, UPSTASH_REDIS_REST_URL, SENTRY_DSN, etc.)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase ESTABLISHES the patterns all future phases follow

### Integration Points
- Phase 2 (Landing Page) connects to: Cloudinary (INTG-03), GA4/pixels (INTG-06), component structure
- Phase 3 (Booking) connects to: `boats`, `bookings`, `boatAvailability` tables; Stripe (INTG-01); Resend (INTG-02)
- Phase 4 (Admin) connects to: `adminUsers` table; NextAuth session
- Phase 5+ connect to: `leads`, `clients`, `leadActivities`, `marketingPosts`, `reviews` tables

</code_context>

<deferred>
## Deferred Ideas

- Seed data for boat fleet — deferred to Phase 2 (Landing Page needs boats to render fleet section)
- Neon branch-per-developer workflow — deferred; standard dev/prod branching sufficient for launch
- Storybook component documentation — not in scope for any phase

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-13*
