---
plan: "01-01"
phase: 1
subsystem: foundation
tags: [scaffold, nextjs, shadcn, typescript, tailwind, drizzle, neon, upstash, sentry]
dependency_graph:
  requires: []
  provides: [next15-scaffold, shadcn-ui-components, typescript-type-stubs, env-template, folder-structure]
  affects: [01-02, all-subsequent-phases]
tech_stack:
  added:
    - next@15.5.15
    - react@19.1.0
    - typescript@5.x
    - tailwindcss@4.x
    - drizzle-orm@0.45.2
    - drizzle-kit@0.31.10
    - "@neondatabase/serverless@1.0.2"
    - "@upstash/redis@1.37.0"
    - "@upstash/ratelimit@2.0.8"
    - "@sentry/nextjs@10.48.0"
    - shadcn@4.2.0
    - clsx@2.x
    - tailwind-merge@3.x
    - class-variance-authority@0.7.x
    - lucide-react@1.x
  patterns:
    - App Router (Next.js 15 with src/ directory layout)
    - shadcn/ui component library via CLI
    - cn() helper pattern (clsx + tailwind-merge)
    - TypeScript path alias @/* -> src/*
    - npm as package manager
key_files:
  created:
    - package.json
    - tsconfig.json
    - next.config.ts
    - .gitignore
    - .env.example
    - components.json
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/globals.css
    - src/lib/utils.ts
    - src/lib/constants.ts
    - src/types/boat.ts
    - src/types/lead.ts
    - src/types/booking.ts
    - src/components/ui/button.tsx
    - src/components/ui/card.tsx
    - src/components/ui/dialog.tsx
    - src/components/ui/sheet.tsx
    - src/components/ui/accordion.tsx
    - src/components/ui/tabs.tsx
    - src/components/ui/calendar.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/separator.tsx
    - src/components/ui/scroll-area.tsx
    - src/components/ui/tooltip.tsx
    - src/components/landing/.gitkeep
    - src/components/booking/.gitkeep
    - src/components/shared/.gitkeep
    - src/hooks/.gitkeep
    - src/lib/db/.gitkeep
  modified: []
decisions:
  - "Scaffolded via temp dir then copied to worktree — create-next-app@15 rejected non-empty directory (existing .planning/, CLAUDE.md)"
  - "shadcn init auto-committed 'feat: initial commit' — shadcn CLI has built-in git integration; left as-is since content is correct"
  - ".gitignore updated to add !.env.example exception — default .env* rule blocked .env.example from being tracked"
  - "Used create-next-app@15 (pinned) which installed next@15.5.15 — confirmed NOT next@16"
metrics:
  duration_minutes: 7
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 30
  files_modified: 3
---

# Phase 1 Plan 01: Scaffold Next.js 15 App with shadcn/ui, Folder Structure, and Type Stubs Summary

## One-liner

Next.js 15.5.15 app scaffolded with TypeScript + Tailwind v4 + shadcn/ui (11 components) + Drizzle/Neon/Upstash/Sentry dependencies + domain type stubs and folder structure per build pack spec.

## What Was Done

### Task 1-01-01: Scaffold Next.js 15 and install Phase 1 dependencies

**Scaffold command used:**
```bash
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

Note: `create-next-app@15` rejected the non-empty worktree directory (existing `.planning/`, `CLAUDE.md`). Deviation: scaffolded into `/tmp/gaff-scaffold` and copied files to worktree, then ran `npm install` to restore node_modules.

**Next.js version confirmed:** `Next.js v15.5.15` (NOT 16.x)

**Dependencies installed:**
| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.5.15 | App framework |
| react / react-dom | 19.1.0 | UI runtime |
| typescript | ^5 | Type safety |
| tailwindcss | ^4 | Styling |
| drizzle-orm | ^0.45.2 | Type-safe ORM |
| drizzle-kit | ^0.31.10 | Schema management CLI |
| @neondatabase/serverless | ^1.0.2 | Neon PostgreSQL driver |
| @upstash/redis | ^1.37.0 | Redis client |
| @upstash/ratelimit | ^2.0.8 | Rate limiting |
| @sentry/nextjs | ^10.48.0 | Error tracking |

**Scripts in package.json:**
- `dev` — `next dev --turbopack`
- `build` — `next build --turbopack`
- `start` — `next start`
- `lint` — `eslint`
- `type-check` — `tsc --noEmit` (added per plan)

**Commits:**
- `bc233cc` — `chore(01-01): scaffold Next.js 15 with all Phase 1 deps`

### Task 1-01-02: Initialize shadcn/ui and establish folder structure

**shadcn/ui initialized** with `npx shadcn@latest init --defaults` (Default style, CSS variables enabled, Tailwind v4 detected automatically).

**shadcn components installed (11 total):**
button, card, dialog, sheet, accordion, tabs, calendar, badge, separator, scroll-area, tooltip

**Folder structure created:**
```
src/
  app/           (layout.tsx, page.tsx, globals.css, favicon.ico)
  components/
    ui/          (11 shadcn components)
    landing/     (.gitkeep)
    booking/     (.gitkeep)
    shared/      (.gitkeep)
  hooks/         (.gitkeep)
  lib/
    utils.ts     (cn() helper)
    constants.ts (SITE_URL, SITE_NAME, CONTACT_EMAIL, CONTACT_PHONE)
    db/          (.gitkeep)
      schema/    (empty, populated in 01-02)
  types/
    boat.ts      (Boat, BoatCategory, TripType)
    lead.ts      (Lead, LeadStatus, LeadSource, LeadClassification)
    booking.ts   (Booking, BookingFormData, BookingStatus)
```

**Environment variables documented** in `.env.example` covering all 8 phases:
DATABASE_URL, UPSTASH_REDIS_REST_URL/TOKEN, SENTRY_DSN/AUTH_TOKEN/ORG/PROJECT, STRIPE keys, RESEND_API_KEY, NEXTAUTH_SECRET/URL, CLOUDINARY keys, OPENAI_API_KEY, META keys, GA4 measurement ID, TIKTOK_ACCESS_TOKEN, NEXT_PUBLIC_SITE_URL

**Commits:**
- `f3267dc` — `feat: initial commit` (auto-generated by shadcn CLI — contains components.json, button.tsx, utils.ts, globals.css)
- `b329965` — `chore(01-01): add shadcn/ui components, folder structure, type stubs, .env.example`

## Verification Results

All criteria passed:

| Check | Result |
|-------|--------|
| `node_modules/.bin/next --version` | Next.js v15.5.15 |
| `npm run lint` | Exit 0 (no errors) |
| `npm run type-check` | Exit 0 (no errors) |
| shadcn components count | 11 files in src/components/ui/ |
| Placeholder dirs exist | landing, booking, shared, hooks — all present |
| Type stubs | boat.ts, lead.ts, booking.ts — all present |
| cn() in utils.ts | Present |
| SITE_URL in constants.ts | Present |
| DATABASE_URL in .env.example | Present |
| OPENAI_API_KEY in .env.example | Present |
| src/lib/db/schema/ exists | Present |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scaffold into temp dir due to non-empty worktree**
- **Found during:** Task 1-01-01
- **Issue:** `create-next-app@15` refused to scaffold into the worktree directory because it contained `.planning/`, `CLAUDE.md`, and `.claude/` (existing planning artifacts). Error: "The directory agent-aafdcfc1 contains files that could conflict."
- **Fix:** Scaffolded into `/tmp/gaff-scaffold`, copied all scaffold files to worktree, then ran `npm install` to restore complete node_modules (the copy was incomplete due to symlink handling on Windows).
- **Impact:** None — all scaffold files are identical to what `create-next-app` would have produced in-place.
- **Files modified:** All scaffold files (same content, different copy path)

**2. [Rule 2 - Missing Critical] Updated .gitignore to allow .env.example**
- **Found during:** Task 1-01-02
- **Issue:** The auto-generated `.gitignore` had `.env*` which blocked `.env.example` from being tracked. `.env.example` is a template with no real secrets and must be committed.
- **Fix:** Added `!.env.example` exception after `.env*` rule in `.gitignore`.
- **Files modified:** `.gitignore`

**3. [Note] shadcn CLI auto-committed**
- `npx shadcn@latest init` created its own git commit (`f3267dc feat: initial commit`) containing `components.json`, `button.tsx`, `utils.ts`, `globals.css`. This is shadcn CLI behavior and cannot be suppressed. The content is correct.

## Known Stubs

The following items are intentional stubs to be filled in by subsequent plans:

| Stub | File | Reason |
|------|------|--------|
| `src/lib/db/schema/` | empty directory | Schema defined in Plan 01-02 |
| `CONTACT_PHONE = '+1-XXX-XXX-XXXX'` | src/lib/constants.ts | Real phone number not yet provided |
| All `.env.example` values | .env.example | Template only — real values set per environment |

## Threat Flags

No new threat surface introduced. Threat model items addressed:
- `.env*.local` blocked by `.gitignore` (`.env*` rule covers it)
- `.env.example` tracked — contains no real secrets (all placeholder values)
- No hardcoded credentials in any source file

## Next Plan

**01-02:** Drizzle ORM schema definition (all 9 domain tables), Neon connection setup, drizzle.config.ts, and migration push.

## Self-Check: PASSED

- [x] `src/components/ui/button.tsx` exists
- [x] `src/types/booking.ts` exists
- [x] `src/types/lead.ts` exists
- [x] `src/types/boat.ts` exists
- [x] `.env.example` exists
- [x] Commits bc233cc, f3267dc, b329965 exist in git log
- [x] `npm run lint && npm run type-check` both exit 0
