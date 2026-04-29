# Roadmap: GAFF All Fishing Los Cabos

## Overview

The platform is built in four natural stages anchored by the build pack: foundation infrastructure, then a premium landing page with real-time booking, then the AI agent suite that automates the full customer lifecycle, then external integrations that connect every channel. Eight phases deliver a complete, bookable, AI-driven fishing charter platform — starting with a working Next.js/Neon foundation and ending with automated analytics reports landing in the admin's inbox every morning.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Scaffold the Next.js app, Neon database, Drizzle schema, Vercel deployment, and observability tooling
- [x] **Phase 2: Landing Page** - Build all landing page sections with animation, performance optimization, SEO metadata, and bilingual support
- [ ] **Phase 3: Booking & Payments** - Implement the real-time availability API, booking flow, Stripe deposit, and confirmation emails
- [x] **Phase 4: Admin Dashboard** - Build NextAuth admin authentication and all 10 admin dashboard pages
- [ ] **Phase 5: Chat & Lead Agent** - Embed Botpress web chat, deploy OpenClaw WhatsApp gateway, and wire the Lead Agent classification and follow-up sequences
- [ ] **Phase 6: CRM & Reviews Agent** - Build the Client Agent lifecycle automations and the Reviews Agent monitoring and response workflow
- [x] **Phase 7: SEO & Marketing Agents** - Wire the SEO Agent content generation and the Marketing Agent social publishing pipeline with Meta and TikTok APIs
- [ ] **Phase 8: Analytics Agent** - Implement the Analytics Agent dashboard population, automated report emails, and intelligent alert system

## Phase Details

### Phase 1: Foundation
**Goal**: The project is scaffolded, the database schema is live, and every environment (dev, preview, production) is wired with CI/CD and observability — so all subsequent phases build on a stable, verified base.
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INTG-07, INTG-08
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts the Next.js 15 app with no TypeScript or lint errors
  2. Drizzle migrations run against Neon without errors and all tables exist in the database
  3. A commit to main triggers the Vercel production deployment and passes lint + type-check in CI
  4. Upstash Redis connection is verified and Sentry captures a test error on both frontend and API
**Plans**: 2

Plans:
- [x] 01-01: Scaffold Next.js 15 app with TypeScript, Tailwind CSS, shadcn/ui, and folder structure per build pack
- [x] 01-02: Define Drizzle schema, run migrations against Neon, and wire Upstash Redis and Sentry

### Phase 2: Landing Page
**Goal**: A US tourist landing on gaffallfishingloscabos.com sees a premium, fast-loading landing page in English (with Spanish toggle) that showcases the fleet, seasons, crew, and conservation — and passes Lighthouse > 90 with full SEO metadata.
**Depends on**: Phase 1
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LAND-07, LAND-08, LAND-09, LAND-10, PERF-01, PERF-02, PERF-03, PERF-04, SEO-01, SEO-02, SEO-03, SEO-04, INTG-03, INTG-06
**Success Criteria** (what must be TRUE):
  1. Hero video loads under 5MB, Framer Motion headline animates on arrival, and both CTAs are visible on mobile and desktop
  2. Fleet section shows all 4 boat categories with pricing, 3D hover effect on desktop, and embla carousel on mobile
  3. Availability calendar renders day-level status colors and a click opens the booking modal pre-filled with the selected date
  4. Lighthouse Performance score is > 90 on production; LCP < 2.5s, CLS < 0.1, JS bundle < 200KB gzipped
  5. Schema.org JSON-LD is present in page source; sitemap.xml and OG tags are verified in production
**Plans**: 4
**UI hint**: yes

Plans:
- [x] 02-01: Hero, Fleet, and Conservation sections with Framer Motion, Cloudinary images, and Lenis scroll
- [x] 02-02: Availability calendar, Fishing Seasons chart, Testimonials carousel, FAQ, Crew, CTA, and Footer sections
- [x] 02-03: SEO metadata (JSON-LD, OG tags, sitemap, robots), bilingual EN/ES support, GA4 + pixel installation, and Lighthouse optimization pass
- [x] 02-04: Analytics bridge, Botpress launcher, dynamic imports, and deployment hardening

Status note:
Preview deployment renders correctly and the phase is clear to move forward.
Lighthouse/Core Web Vitals evidence and deeper functional review are deferred to follow-up hardening.

### Phase 3: Booking & Payments
**Goal**: A visitor can select a date and boat on the calendar, complete the booking form, pay a 50% deposit via Stripe, and immediately receive a confirmation email — and the boat is blocked from double-booking.
**Depends on**: Phase 2
**Requirements**: BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, BOOK-06, BOOK-07, INTG-01, INTG-02
**Success Criteria** (what must be TRUE):
  1. The availability API returns accurate per-boat, per-day status and the calendar reflects it without page reload
  2. The booking form collects all required fields (date, boat, trip type, guest count, name, email, phone) and validates before submitting
  3. Stripe checkout session opens for the 50% deposit amount; a completed payment redirects to the confirmation page with trip summary
  4. The Stripe webhook updates booking status to `deposit_paid` and blocks the boat availability record within seconds of payment
  5. Booking confirmation email arrives in the customer's inbox within 2 minutes of payment via Resend
**Plans**: 2

Plans:
- [ ] 03-01: Availability API, booking form, and booking database write logic
- [ ] 03-02: Stripe checkout session creation, webhook processing, confirmation page, and Resend booking email

### Phase 4: Admin Dashboard
**Goal**: An admin can log in securely and navigate all 10 dashboard pages — viewing KPIs, managing leads and bookings, editing fleet, monitoring agents, reviewing social content, and adjusting settings.
**Depends on**: Phase 3
**Requirements**: AUTH-01, AUTH-02, AUTH-03, ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09, ADMN-10
**Success Criteria** (what must be TRUE):
  1. Admin logs in with email + password; session persists across browser tabs and unauthenticated routes redirect to `/admin/login`
  2. Dashboard KPI widgets show live bookings, revenue totals, pipeline leads, and fleet occupancy with correct figures from the database
  3. Leads and clients tables support search, filter, and pagination; detail pages show interaction timelines and trip histories
  4. Fleet management page allows adding and editing boats and toggling maintenance windows; bookings calendar shows per-boat per-day status
  5. All 10 admin section pages render without errors (agents panel, marketing, SEO, reviews, settings)
**Plans**: 3
**UI hint**: yes

Plans:
- [ ] 04-01: NextAuth credentials provider, JWT sessions, role-based middleware, and `/admin/login` page
- [ ] 04-02: Dashboard KPIs, leads table + detail, clients table + detail, and bookings calendar pages
- [ ] 04-03: Fleet management, agents panel, marketing, SEO, reviews, and settings pages

### Phase 5: Chat & Lead Agent
**Goal**: A visitor can chat with GAFF via the Botpress widget on the landing page or via WhatsApp through OpenClaw — and every lead captured by either channel is automatically classified and entered into a timed follow-up sequence.
**Depends on**: Phase 4
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06
**Success Criteria** (what must be TRUE):
  1. Botpress widget loads asynchronously on the landing page with GAFF color theme and FAQ data from the shared JSON knowledge base
  2. OpenClaw WhatsApp gateway is running and the `gaff-booking` agent responds to booking and FAQ queries via WhatsApp within 30 seconds
  3. A lead captured from any channel (web form, chat, WhatsApp) appears in the database with source, contact info, and status `new` within 1 minute
  4. Lead Agent classifies the lead as hot/warm/cold using GPT-4o-mini within 5 minutes and triggers the correct follow-up sequence (email + WhatsApp)
  5. Admin dashboard shows an alert when a hot lead has not been contacted within 2 hours
**Plans**: 3

Plans:
- [x] 05-01: Canonical FAQ contract and Botpress bridge alignment
- [x] 05-02: OpenClaw ingress and cross-channel lead normalization
- [x] 05-03: Lead Agent classification, follow-up sequencing, and hot-lead alerts

Status note:
Phase 5 is implemented and verified. Phase 6 is ready for planning.

### Phase 6: CRM & Reviews Agent
**Goal**: Every completed trip creates a client record that receives anniversary emails, seasonal promotions, and re-engagement campaigns — and every new review across TripAdvisor, Google, and Yelp gets a draft response surfaced in admin within one hour of detection.
**Depends on**: Phase 5
**Requirements**: CRM-01, CRM-02, CRM-03, CRM-04, CRM-05, REVW-01, REVW-02, REVW-03
**Success Criteria** (what must be TRUE):
  1. A booking reaching `completed` status automatically creates or enriches a client record with trip history and fish caught
  2. Post-trip review request email is sent to the client 24 hours after `completed` status with direct TripAdvisor and Google links
  3. Client Agent sends trip anniversary email 1 year after trip date and seasonal promotions to the matching segment
  4. Reviews Agent polls all three platforms and surfaces new reviews in the admin reviews page within 1 hour; each has a GPT-4o draft response ready for approval
  5. Admin receives a high-priority alert within 1 hour when any review is rated 3 stars or below
**Plans**: 3

Plans:
- [x] 06-01: Client record creation on booking completion, trip history enrichment, anniversary and seasonal promotion emails, and re-engagement campaign (CRM-01 through CRM-04)
- [x] 06-02: Post-trip review request email, TripAdvisor/Google/Yelp polling, GPT-4o draft response generation, admin reviews page wiring, and low-star alert (CRM-05, REVW-01 through REVW-03)

Status note:
Phase 6 is implemented and verified. Phase 7 is ready for planning.

### Phase 7: SEO & Marketing Agents
**Goal**: The SEO Agent automatically generates weekly blog posts and per-trip fishing reports that index fresh content, while the Marketing Agent maintains a content calendar and auto-publishes to Instagram, Facebook, and TikTok at optimal US time-zone hours.
**Depends on**: Phase 6
**Requirements**: SEOAG-01, SEOAG-02, SEOAG-03, SEOAG-04, MKTG-01, MKTG-02, MKTG-03, MKTG-04, INTG-04, INTG-05
**Success Criteria** (what must be TRUE):
  1. SEO Agent generates and stores a new English blog post every week targeting primary keywords; admins can view and edit it in the SEO section
  2. A fishing report is auto-generated within 1 hour of a trip reaching `completed` status and appears in the admin SEO section
  3. Marketing Agent generates a weekly content calendar visible in the admin marketing section with captions and hashtags for all three platforms
  4. Marketing Agent auto-publishes approved posts to Instagram and Facebook via Meta Graph API; TikTok Pixel fires conversion events
  5. Weekly keyword ranking report is available in the admin SEO section comparing target keywords against piscessportfishing.com
**Plans**: 3

Plans:
- [x] 07-01: SEO Agent — weekly blog post generation, per-trip fishing report, meta description updates, and keyword ranking report via Vercel Cron
- [x] 07-02: Meta Graph API authentication and Instagram/Facebook auto-publishing pipeline
- [x] 07-03: Marketing Agent content calendar generation, TikTok for Business API integration, comment engagement drafts, and Meta Ads management

Status note:
Phase 7 is implemented and verified. Phase 8 is ready for planning.

### Phase 8: Analytics Agent
**Goal**: The admin dashboard shows live KPIs populated by the Analytics Agent, and the agent sends daily and weekly automated report emails with intelligent alerts for underperformance conditions.
**Depends on**: Phase 7
**Requirements**: ANLX-01, ANLX-02, ANLX-03, ANLX-04
**Success Criteria** (what must be TRUE):
  1. Admin dashboard KPI widgets (bookings, revenue, leads by status, fleet occupancy) show current data populated by the Analytics Agent without manual refresh
  2. Admin receives a daily email report with bookings, leads captured, and revenue totals from the previous day
  3. Admin receives a weekly report with marketing performance and SEO keyword movements
  4. Intelligent alerts fire correctly: boat idle > 3 days, lead conversion rate drop > 20%, review score < 4.5
**Plans**: 1

Plans:
- [x] 08-01: Analytics Agent — KPI dashboard population, daily report email, weekly report email, and intelligent alert system via Vercel Cron

Status note:
Phase 8 is implemented and verified.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Completed | 2026-04-14 |
| 2. Landing Page | 4/4 | Completed with follow-up hardening | 2026-04-14 |
| 3. Booking & Payments | 2/2 | Implemented - pending live verification | 2026-04-14 |
| 4. Admin Dashboard | 3/3 | Completed | 2026-04-15 |
| 5. Chat & Lead Agent | 3/3 | Completed | 2026-04-15 |
| 6. CRM & Reviews Agent | 2/2 | Completed | 2026-04-15 |
| 7. SEO & Marketing Agents | 3/3 | Completed | 2026-04-15 |
| 8. Analytics Agent | 1/1 | Completed | 2026-04-15 |



### Phase 9: Upgrade Agentes — Integrar marketingskills dentro de los agentes existentes

**Goal:** Elevar la calidad de outputs de los 6 agentes GAFF integrando frameworks de marketing de marketingskills: enriquecer los system prompts de todos los agentes LLM, crear product-marketing-context.md con el positioning de GAFF, añadir generación LLM a los agentes que solo tenían lógica determinística, y refactorizar el SEO Agent para programmatic SEO con páginas de fishing reports públicas indexables.
**Requirements**: TBD (phase uses research findings as source of truth — no formal requirement IDs assigned)
**Depends on:** Phase 8
**Plans:** 4 plans

Plans:
- [ ] 09-01-PLAN.md — Foundation: git submodule marketingskills, product-marketing-context.md, Lead Agent psychology enrichment, follow-up sequence rewrite
- [ ] 09-02-PLAN.md — SEO + Reviews upgrade: pSEO slug architecture, /fishing-reports/[slug] public route, schema.org Article markup, llms.txt, Reviews Agent brand voice
- [ ] 09-03-PLAN.md — Marketing upgrade: LLM caption generation with social-content hook formulas, competitor-anchored prompts, comment reply drafts
- [ ] 09-04-PLAN.md — CRM upgrade: LLM email content generation for anniversary/seasonal/re-engagement campaigns with email-sequence and churn-prevention frameworks
