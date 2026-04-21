# Phase 4: Admin Dashboard - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 turns GAFF from a public booking site into an internal operating tool. An authenticated admin must be able to sign in, land inside a protected `/admin` area, and use dashboard pages to inspect bookings, leads, clients, fleet status, and future AI-agent surfaces.

This phase owns admin authentication, protected admin routing, KPI read models, and the first full admin information architecture. It does not implement the actual agent automations from Phases 5 through 8, but it must create the pages and data contracts those later phases will extend.

</domain>

<decisions>
## Implementation Decisions

### Authentication and access
- **D-01:** Use NextAuth credentials auth for admin sign-in, backed by the existing `admin_users` table, so admin access stays inside the current Neon/Next.js stack.
- **D-02:** Protect `/admin/*` with middleware and redirect unauthenticated visitors to `/admin/login`.
- **D-03:** Use JWT-backed sessions for the initial admin implementation to keep deployment simple on Vercel and avoid introducing a second session store in this phase.
- **D-04:** Enforce role-aware access now at the route/layout/data level (`admin`, `manager`, `viewer`) even if the initial seeded users are minimal.

### Dashboard scope
- **D-05:** Split the admin UI into a stable shell plus focused pages instead of one oversized dashboard route. Phase 4 must make all 10 roadmap pages navigable.
- **D-06:** KPI, leads, clients, bookings, and fleet views should use real Neon-backed queries where the schema already exists.
- **D-07:** Agents, marketing, SEO, reviews, and settings pages should ship as functional admin surfaces with correct routing and status cards even if some deeper actions remain placeholders for later phases.
- **D-08:** Bookings and fleet views must respect the same availability truth established in Phase 3; no duplicate admin-only availability model should be introduced.

### UX and admin ergonomics
- **D-09:** The admin area should feel intentionally different from the public landing, but still aligned with GAFF branding. It should optimize for fast scanning, navigation clarity, and dense operational data.
- **D-10:** Every admin page should have loading, empty, and error states from the start so later agent-backed pages do not feel broken before integrations arrive.

### Claude's Discretion
- Exact sidebar/topbar layout, card composition, and table tooling
- Whether auth helpers live in `src/lib/auth/`, `src/lib/admin/`, or a combined domain folder, as long as responsibilities stay clear
- Whether read models are implemented inline in routes or through reusable query helpers, as long as data access remains testable and composable

</decisions>

<specifics>
## Specific Ideas

- The repo already contains `src/lib/db/schema/admin-users.ts`, `leads`, `clients`, `bookings`, `boats`, `boat_availability`, `marketing_posts`, and `reviews`; Phase 4 should build directly on those tables instead of inventing temporary JSON mocks.
- The app currently has no admin routes or auth surface at all, so Phase 4 must establish the route tree, layout shell, and middleware baseline before trying to fill deep pages.
- Because later phases depend on admin sections existing, this phase should create stable route names now: dashboard, leads, clients, bookings, fleet, agents, marketing, SEO, reviews, settings.
- Phase 3 already proved booking and availability logic in production; the admin bookings/fleet surfaces should read that same data to avoid drift between public and internal views.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap
- `.planning/PROJECT.md` - product constraints and platform choices
- `.planning/REQUIREMENTS.md` - AUTH-01 through AUTH-03 and ADMN-01 through ADMN-10
- `.planning/ROADMAP.md` - Phase 4 goal, dependency on Phase 3, and success criteria
- `.planning/STATE.md` - current milestone position and pending Phase 3 verification context

### Prior phase outputs that admin must honor
- `.planning/phases/03-booking-payments/03-CONTEXT.md` - booking truth model and availability decisions
- `.planning/phases/03-booking-payments/03-RESEARCH.md` - booking architecture constraints and Neon/Stripe patterns
- `.planning/phases/03-booking-payments/03-01-PLAN.md` - booking read/write model shape
- `.planning/phases/03-booking-payments/03-02-PLAN.md` - payment confirmation and webhook expectations

### Existing code Phase 4 must extend
- `src/lib/db/index.ts` - Drizzle Neon connection
- `src/lib/db/schema/admin-users.ts` - admin auth source of truth
- `src/lib/db/schema/leads.ts` - leads data model
- `src/lib/db/schema/clients.ts` - clients data model
- `src/lib/db/schema/bookings.ts` - bookings data model
- `src/lib/db/schema/boats.ts` - fleet data model
- `src/lib/db/schema/availability.ts` - boat/day availability model
- `src/lib/db/schema/activities.ts` - lead timeline source
- `src/lib/db/schema/marketing.ts` - marketing surface source
- `src/lib/db/schema/reviews.ts` - reviews/admin moderation source

### External implementation reference
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` - admin dashboard page list and launch expectations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The public app already has a polished design language, shared `Button` and calendar primitives, and booking/availability query patterns that can be reused in admin.
- Drizzle schema coverage is broad enough to support a meaningful admin read layer now.
- Booking and availability APIs already established the operational source of truth for reservations.

### Gaps Phase 4 must fill
- No `middleware.ts` exists yet for auth protection.
- No NextAuth config, auth helpers, or admin route tree exist yet.
- No admin layout, table, metric-card, or shell components exist yet.
- No seeded admin credential path is visible yet, so execution must decide how the first admin user is provisioned safely.

### Integration Points
- Admin auth must align with Vercel and Next.js App Router.
- KPI pages should derive from Neon directly, not from public APIs.
- Future agent pages should have stable routes and status contracts ready for Phase 5+.

</code_context>

<deferred>
## Deferred Ideas

- SSO / magic-link / MFA flows
- Fine-grained permission matrix beyond `admin`, `manager`, `viewer`
- Full CRUD and publish actions for marketing, SEO, reviews, and settings integrations
- Real background-job logs and agent telemetry beyond basic status/readiness cards

</deferred>

---

*Phase: 04-admin-dashboard*
*Context gathered: 2026-04-14*
