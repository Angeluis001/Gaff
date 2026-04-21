# Phase 4: Admin Dashboard - Research

**Researched:** 2026-04-14
**Domain:** Next.js 15 admin architecture, NextAuth credentials auth, protected App Router routes, and Neon-backed dashboard read models
**Confidence:** HIGH for stack fit and route architecture; MEDIUM for exact admin UX density because the repo has no existing admin surface yet

---

<phase_requirements>
## Phase Requirements

| ID | Description | Planning Impact |
|----|-------------|-----------------|
| AUTH-01 | Admin signs in with credentials auth | Requires login route, password verification, and admin user bootstrap path |
| AUTH-02 | JWT session persists and protects `/admin/*` | Requires auth config plus middleware/route guarding |
| AUTH-03 | Role-based access enforced | Requires typed role model, session claims, and route-aware authorization helpers |
| ADMN-01 | KPI dashboard shows bookings, revenue, leads, occupancy | Requires admin read-model queries and metric aggregation |
| ADMN-02 | Leads table and detail timeline | Requires searchable list query plus activity timeline detail page |
| ADMN-03 | Clients table and detail | Requires segmentation filters and trip history joins |
| ADMN-04 | Bookings calendar and detail | Requires booking/day read model over bookings + availability |
| ADMN-05 | Fleet management and maintenance windows | Requires boat CRUD/editing and availability mutation surface |
| ADMN-06 | Agents panel | Requires page shell plus structured status cards for future agents |
| ADMN-07 | Marketing section | Requires route, table shell, and status wiring for future content/posts |
| ADMN-08 | SEO section | Requires route, rankings/posts report shell, and future extension points |
| ADMN-09 | Reviews section | Requires route, reviews list, response-draft placeholders, and platform rollups |
| ADMN-10 | Settings section | Requires route, user management surface, and integration-key health view |

</phase_requirements>

---

## Summary

Phase 4 should be split into three executable waves:

1. **Auth and admin shell**
   Build NextAuth credentials auth, JWT session claims, middleware protection, `/admin/login`, `/admin` layout, and navigation shell.
2. **Operational pages with real data**
   Build KPI dashboard, leads, clients, bookings, and fleet pages on top of Neon data that already exists.
3. **Future-facing admin pages**
   Build agents, marketing, SEO, reviews, and settings pages as real routes with stable read models/placeholders so later phases extend them instead of replacing them.

This split keeps the critical-path foundation small: nothing in the rest of the admin area matters unless auth and shell routing exist first.

---

## Critical Findings

### 1. The schema is already admin-friendly

The project already has:
- `admin_users`
- `leads`
- `lead_activities`
- `clients`
- `bookings`
- `boats`
- `boat_availability`
- `marketing_posts`
- `reviews`

That means Phase 4 is mostly a read-model and route problem, not a schema-invention problem.

### 2. NextAuth credentials is the right first auth shape

Given the current stack:
- Next.js App Router on Vercel
- Neon-backed admin table
- no existing OAuth requirement

credentials auth with JWT sessions is the lowest-friction choice. It matches AUTH-01 and AUTH-02 without needing extra infra.

### 3. Middleware should only guard the admin tree

The public marketing and booking site is already live. Middleware for Phase 4 should protect `/admin/:path*` and leave public routes untouched.

### 4. The first admin user is a planning concern, not a UI afterthought

Because `admin_users` already exists, execution must define how the first password-hash user gets created:
- seed script,
- env-backed bootstrap route,
- or migration-time insert.

Without that, auth can compile but remain unusable.

### 5. The bookings/fleet admin pages must reuse Phase 3 truth

The landing and booking flow now depend on:
- `bookings`
- `boat_availability`
- `boats`

The admin calendar and fleet pages must read those same tables directly. Recomputing status from a different algorithm would create internal/public drift.

### 6. Not all 10 pages need full business depth in one wave

Phase 4 success says all 10 pages render without errors. That does not mean marketing/SEO/reviews/agents must already have their Phase 5-8 business logic.

The plan should therefore:
- fully implement auth and core operational pages,
- provide robust scaffolded pages for future sections,
- and leave agent behavior to later phases.

---

## Recommended Architecture

### Auth surface

```text
src/auth.ts
src/middleware.ts
src/lib/auth/
  config.ts
  authorize.ts
  session.ts
src/app/admin/login/page.tsx
```

### Admin route tree

```text
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/leads/page.tsx
src/app/admin/leads/[id]/page.tsx
src/app/admin/clients/page.tsx
src/app/admin/clients/[id]/page.tsx
src/app/admin/bookings/page.tsx
src/app/admin/bookings/[id]/page.tsx
src/app/admin/fleet/page.tsx
src/app/admin/agents/page.tsx
src/app/admin/marketing/page.tsx
src/app/admin/seo/page.tsx
src/app/admin/reviews/page.tsx
src/app/admin/settings/page.tsx
```

### Shared admin UI

```text
src/components/admin/
  AdminShell.tsx
  AdminSidebar.tsx
  AdminTopbar.tsx
  StatCard.tsx
  DataTableShell.tsx
  EmptyState.tsx
```

### Read-model helpers

```text
src/lib/admin/
  dashboard.ts
  leads.ts
  clients.ts
  bookings.ts
  fleet.ts
  settings.ts
```

---

## Pitfalls

- Building pages before auth creates duplicated protection logic.
- Shipping login without a first-admin bootstrap path creates a dead-end.
- Enforcing roles only in the client leaves the admin surface spoofable.
- Overbuilding agents/marketing/SEO/reviews now would blur boundaries with Phases 5-8.
- Giant page components will become hard to extend if read models are not centralized.

---

## Primary Recommendation

Plan Phase 4 as three waves:

1. **04-01 Auth and shell**
2. **04-02 Core operations**
3. **04-03 Future-section scaffolds**

This gives GAFF a usable internal console quickly without forcing later phases to undo Phase 4 work.

---

*Research completed: 2026-04-14*
