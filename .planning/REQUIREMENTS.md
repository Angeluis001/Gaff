# Requirements: GAFF All Fishing Los Cabos

**Defined:** 2026-04-13
**Core Value:** A US tourist discovers GAFF, checks real-time boat availability, books and pays a deposit online — and AI handles follow-up from that moment forward.

## v1 Requirements

### Foundation & Infrastructure

- [ ] **INFRA-01**: Next.js 15 app scaffolded with TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, Neon PostgreSQL connection
- [ ] **INFRA-02**: Project folder structure matches build pack specification (app router, src/, components/landing, components/booking, lib/db, etc.)
- [ ] **INFRA-03**: Drizzle schema defined for boats, leads, clients, bookings, boatAvailability, leadActivities, marketingPosts, reviews, adminUsers tables
- [ ] **INFRA-04**: Database migrations run successfully against Neon serverless PostgreSQL
- [ ] **INFRA-05**: Vercel deployment configured (production + preview environments, environment variables set)
- [ ] **INFRA-06**: CI/CD pipeline active (lint, type-check, migration validation on PR)

### Landing Page — Core Sections

- [ ] **LAND-01**: Hero section with optimized video background (< 5MB), animated headline via Framer Motion staggerChildren, "Book Now" and "Watch Video" CTAs, transparent-to-solid navbar on scroll
- [ ] **LAND-02**: Fleet showcase with 4 boat category cards (Standard, Midsize, Large, Luxury), 3D hover effect, mobile carousel via embla-carousel, price display, and individual Book CTA
- [ ] **LAND-03**: Real-time boat availability calendar showing day-level status (green/amber/red), per-boat filtering, click-to-book modal pre-filled with selected date
- [ ] **LAND-04**: Fishing seasons chart — SVG animated bars per species (Marlin, Tuna, Dorado, Wahoo, Roosterfish) with current month highlighted and tooltip details
- [ ] **LAND-05**: Testimonials carousel with TripAdvisor reviews, animated stat counters (trips, rating, years in business), certification logos
- [ ] **LAND-06**: Interactive FAQ with tabbed categories (General, Booking, On the Boat), real-time client-side search, AnimatePresence accordion, "Chat with us" button that opens Botpress widget
- [ ] **LAND-07**: Crew/captains section with photo cards, years of experience, specialty, and certification badges on hover
- [ ] **LAND-08**: Conservation section with catch-and-release video, IGFA and GrayFishTag badges
- [ ] **LAND-09**: Final CTA section with panoramic background image and booking prompt
- [ ] **LAND-10**: Footer with Google Maps embed (marina location), phone, email, social links, and legal links (Privacy Policy, Terms of Service)

### Landing Page — Technical Quality

- [ ] **PERF-01**: Lighthouse Performance score > 90 on production build
- [ ] **PERF-02**: LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals passing)
- [ ] **PERF-03**: JavaScript bundle < 200KB gzipped
- [ ] **PERF-04**: Lenis smooth scroll configured globally
- [ ] **SEO-01**: SEO metadata (title, description, keywords, OG tags, Twitter card) set for all pages via Next.js Metadata API
- [ ] **SEO-02**: Schema.org JSON-LD (TouristAttraction type) embedded in layout
- [ ] **SEO-03**: Canonical URLs, robots meta, and sitemap.xml configured
- [ ] **SEO-04**: Bilingual support — English default with Spanish alternate route or toggle

### Booking System

- [ ] **BOOK-01**: Availability API (`/api/booking/availability`) returns per-boat, per-day status from database
- [ ] **BOOK-02**: Booking form collects: date, boat selection, trip type (half/full day), guest count, name, email, phone, special requests
- [ ] **BOOK-03**: Stripe checkout session created for 50% deposit; success and cancel redirect URLs handled
- [ ] **BOOK-04**: Stripe webhook processes payment confirmation and updates booking status to `deposit_paid`
- [ ] **BOOK-05**: Booking confirmation page shown after successful payment with trip summary
- [ ] **BOOK-06**: Booking confirmation email sent via Resend upon deposit payment
- [ ] **BOOK-07**: Boat availability record blocked when booking is confirmed (prevents double-booking)

### Admin Authentication

- [ ] **AUTH-01**: Admin can log in via NextAuth.js credentials provider (email + bcrypt password)
- [ ] **AUTH-02**: Admin session persists via JWT; protected routes redirect unauthenticated users to `/admin/login`
- [ ] **AUTH-03**: Role-based access enforced (admin vs. read-only roles)

### Admin Dashboard

- [ ] **ADMN-01**: Dashboard page shows KPI widgets — bookings (today/week/month), revenue (total/by boat/by channel), leads in pipeline by status, fleet occupancy rate
- [ ] **ADMN-02**: Leads table with search, filter by status/source/classification, pagination; lead detail page shows interaction timeline
- [ ] **ADMN-03**: Clients table with search, segmentation filters (species, spend, frequency); client detail page shows trip history and preferences
- [ ] **ADMN-04**: Bookings calendar view (month) showing status per boat per day; booking detail shows payment status, notes, fish caught
- [ ] **ADMN-05**: Fleet management page — add/edit boats, toggle availability, mark maintenance windows
- [ ] **ADMN-06**: Agents panel shows each AI agent's status (active/idle/error), last run, and recent logs
- [ ] **ADMN-07**: Marketing section — content calendar, posts (draft/scheduled/published), Meta Ads overview, social analytics
- [ ] **ADMN-08**: SEO section — keyword rankings table, generated blog posts list, performance reports
- [ ] **ADMN-09**: Reviews page — reviews by platform, pending response drafts (approve/edit/publish), overall rating per platform
- [ ] **ADMN-10**: Settings page — general config, user management, integration keys status

### Chat Integration

- [ ] **CHAT-01**: Botpress web chat widget embedded on landing page (loads async script, custom GAFF color theme)
- [ ] **CHAT-02**: FAQ data exported to JSON file consumed by both Botpress knowledge base and OpenClaw skill
- [ ] **CHAT-03**: OpenClaw WhatsApp gateway deployed and running with `gaff-booking` agent configured (GPT-4o, booking/faq/lead-capture/availability skills)
- [ ] **CHAT-04**: Both chat channels (web + WhatsApp) write leads and bookings to the same Neon database

### Lead Management (AI Agent)

- [ ] **LEAD-01**: Lead captured from any channel (web form, chat, WhatsApp, Instagram DM) is written to `leads` table with source, contact info, and initial metadata
- [ ] **LEAD-02**: Lead Agent classifies each new lead as hot/warm/cold using GPT-4o-mini within 5 minutes of capture
- [ ] **LEAD-03**: Automated follow-up sequences triggered by classification: hot (1h email + 4h WhatsApp), warm (24h email + 72h WhatsApp), cold (48h email + 7d email)
- [ ] **LEAD-04**: Follow-up messages are personalized via GPT-4o using lead data (name, preferred date, boat interest)
- [ ] **LEAD-05**: Lead status transitions tracked in `leadActivities` timeline (new → contacted → qualified → booked → completed)
- [ ] **LEAD-06**: Admin notified (in-dashboard alert) when a hot lead has not been contacted within 2 hours

### CRM / Client Agent

- [ ] **CRM-01**: Client record created automatically when booking status reaches `completed`; enriched with trip history, fish caught, preferences
- [ ] **CRM-02**: Client Agent sends trip anniversary emails ("It's been 1 year since your Marlin catch!")
- [ ] **CRM-03**: Client Agent sends seasonal promotions to relevant segments (e.g., Tuna season alert to clients who caught Tuna)
- [ ] **CRM-04**: Client Agent sends re-engagement campaign to clients inactive > 6 months
- [ ] **CRM-05**: Post-trip review request email sent 24h after `completed` status with direct links to TripAdvisor and Google

### SEO Agent

- [ ] **SEOAG-01**: SEO Agent generates weekly English blog post targeting primary keywords; stores in `seo_posts` table and admin SEO section
- [ ] **SEOAG-02**: SEO Agent auto-generates fishing report after each completed trip (species, weather, results) for fresh indexed content
- [ ] **SEOAG-03**: SEO Agent generates and updates meta descriptions for all pages when content changes
- [ ] **SEOAG-04**: SEO Agent produces weekly keyword ranking report (target keywords vs. competitor piscessportfishing.com)

### Marketing Agent (Social Media)

- [ ] **MKTG-01**: Marketing Agent generates weekly content calendar with captions + hashtags for Instagram, TikTok, Facebook
- [ ] **MKTG-02**: Marketing Agent auto-publishes posts to Instagram and Facebook via Meta Graph API at optimized US time-zone hours
- [ ] **MKTG-03**: Marketing Agent generates response drafts for Instagram/Facebook comments flagged for engagement (human-approved)
- [ ] **MKTG-04**: Marketing Agent creates and monitors Meta Ads campaigns targeting US travelers and fishing enthusiasts; retargeting for site visitors

### Reviews Agent

- [ ] **REVW-01**: Reviews Agent polls TripAdvisor, Google, and Yelp for new reviews; stores in `reviews` table
- [ ] **REVW-02**: Reviews Agent generates personalized response draft for each new review using GPT-4o; presents in admin reviews page for human approval before publishing
- [ ] **REVW-03**: Reviews Agent triggers high-priority admin alert for any review rated ≤ 3 stars within 1 hour of detection

### Analytics Agent

- [ ] **ANLX-01**: Analytics Agent populates real-time dashboard: bookings count, revenue, leads by status, fleet occupancy rate
- [ ] **ANLX-02**: Analytics Agent sends automated daily report email to admin: bookings, leads captured, revenue
- [ ] **ANLX-03**: Analytics Agent sends automated weekly report: marketing performance, SEO keyword movements
- [ ] **ANLX-04**: Analytics Agent fires intelligent alerts: boat idle > 3 days, lead conversion rate drop > 20%, review score < 4.5

### External Integrations

- [ ] **INTG-01**: Stripe payments fully wired (checkout session creation, webhook verification, payment intent tracking)
- [ ] **INTG-02**: Resend email configured with custom domain (`bookings@gaffallfishingloscabos.com`), transactional templates for booking confirmation, lead follow-up, review request
- [ ] **INTG-03**: Cloudinary configured for all media (boat images, crew photos, gallery) with auto-format WebP and quality auto transforms
- [ ] **INTG-04**: Meta Graph API authenticated (long-lived page token) for Instagram + Facebook publish and insights read
- [ ] **INTG-05**: TikTok for Business API integrated for video publishing and TikTok Pixel conversion tracking
- [ ] **INTG-06**: Google Analytics 4 + Meta Pixel + TikTok Pixel installed and firing events (pageview, booking_started, booking_completed, lead_captured)
- [ ] **INTG-07**: Upstash Redis configured for rate limiting on API routes and job queuing for agent tasks via Vercel Cron
- [ ] **INTG-08**: Sentry configured for error tracking and performance monitoring on both frontend and API routes

---

## v2 Requirements

### Payments

- **PAY-01**: Stripe Connect split payments — GAFF retains % and auto-pays captain accounts
- **PAY-02**: Online balance payment (pre-trip) — currently balance collected in person day-of

### Communications

- **COMM-01**: Twilio SMS as backup channel for lead follow-up when email + WhatsApp unresponsive
- **COMM-02**: WhatsApp Business API (Meta official) migration for higher volume / compliance

### Content & SEO

- **CONT-01**: Per-species landing pages (e.g., `/marlin-fishing-cabo`, `/tuna-fishing-cabo`) with dedicated SEO targeting
- **CONT-02**: Per-season landing pages
- **CONT-03**: Blog/fishing reports public-facing page with pagination and RSS

### Social

- **SOCL-01**: TripAdvisor Content API review sync (currently polling-based; upgrade to webhook when available)
- **SOCL-02**: Automated Instagram DM response routing to Bot Agent

### Analytics

- **ANLX-01**: Hotjar heatmaps and session recordings integration
- **ANLX-02**: Competitor benchmarking dashboard (vs. piscessportfishing.com)
- **ANLX-03**: Monthly P&L report with estimated cost-per-acquisition

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Guest-facing mobile app (iOS/Android) | Web-first launch; mobile later if analytics justify it |
| Multi-location support | Los Cabos only for v1; expand if business grows |
| OpenClaw WebChat on landing | Less polished than Botpress widget; not appropriate for premium landing UX |
| Stripe Connect (captain payouts) | Business process complexity; deferred to v2 |
| Online balance payment | Industry norm is in-person day-of; adds refund complexity |
| SMS via Twilio (v1) | Email + WhatsApp covers launch channels adequately |
| Real-time WebSocket availability | Polling every 60s sufficient for booking volume at launch |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| INFRA-06 | Phase 1 | Pending |
| INTG-07 | Phase 1 | Pending |
| INTG-08 | Phase 1 | Pending |
| LAND-01 | Phase 2 | Pending |
| LAND-02 | Phase 2 | Pending |
| LAND-03 | Phase 2 | Pending |
| LAND-04 | Phase 2 | Pending |
| LAND-05 | Phase 2 | Pending |
| LAND-06 | Phase 2 | Pending |
| LAND-07 | Phase 2 | Pending |
| LAND-08 | Phase 2 | Pending |
| LAND-09 | Phase 2 | Pending |
| LAND-10 | Phase 2 | Pending |
| PERF-01 | Phase 2 | Pending |
| PERF-02 | Phase 2 | Pending |
| PERF-03 | Phase 2 | Pending |
| PERF-04 | Phase 2 | Pending |
| SEO-01 | Phase 2 | Pending |
| SEO-02 | Phase 2 | Pending |
| SEO-03 | Phase 2 | Pending |
| SEO-04 | Phase 2 | Pending |
| INTG-03 | Phase 2 | Pending |
| INTG-06 | Phase 2 | Pending |
| BOOK-01 | Phase 3 | Pending |
| BOOK-02 | Phase 3 | Pending |
| BOOK-03 | Phase 3 | Pending |
| BOOK-04 | Phase 3 | Pending |
| BOOK-05 | Phase 3 | Pending |
| BOOK-06 | Phase 3 | Pending |
| BOOK-07 | Phase 3 | Pending |
| INTG-01 | Phase 3 | Pending |
| INTG-02 | Phase 3 | Pending |
| AUTH-01 | Phase 4 | Pending |
| AUTH-02 | Phase 4 | Pending |
| AUTH-03 | Phase 4 | Pending |
| ADMN-01 | Phase 4 | Pending |
| ADMN-02 | Phase 4 | Pending |
| ADMN-03 | Phase 4 | Pending |
| ADMN-04 | Phase 4 | Pending |
| ADMN-05 | Phase 4 | Pending |
| ADMN-06 | Phase 4 | Pending |
| ADMN-07 | Phase 4 | Pending |
| ADMN-08 | Phase 4 | Pending |
| ADMN-09 | Phase 4 | Pending |
| ADMN-10 | Phase 4 | Pending |
| CHAT-01 | Phase 5 | Pending |
| CHAT-02 | Phase 5 | Pending |
| CHAT-03 | Phase 5 | Pending |
| CHAT-04 | Phase 5 | Pending |
| LEAD-01 | Phase 5 | Pending |
| LEAD-02 | Phase 5 | Pending |
| LEAD-03 | Phase 5 | Pending |
| LEAD-04 | Phase 5 | Pending |
| LEAD-05 | Phase 5 | Pending |
| LEAD-06 | Phase 5 | Pending |
| CRM-01 | Phase 6 | Pending |
| CRM-02 | Phase 6 | Pending |
| CRM-03 | Phase 6 | Pending |
| CRM-04 | Phase 6 | Pending |
| CRM-05 | Phase 6 | Pending |
| REVW-01 | Phase 6 | Pending |
| REVW-02 | Phase 6 | Pending |
| REVW-03 | Phase 6 | Pending |
| SEOAG-01 | Phase 7 | Pending |
| SEOAG-02 | Phase 7 | Pending |
| SEOAG-03 | Phase 7 | Pending |
| SEOAG-04 | Phase 7 | Pending |
| MKTG-01 | Phase 7 | Pending |
| MKTG-02 | Phase 7 | Pending |
| MKTG-03 | Phase 7 | Pending |
| MKTG-04 | Phase 7 | Pending |
| INTG-04 | Phase 7 | Pending |
| INTG-05 | Phase 7 | Pending |
| ANLX-01 | Phase 8 | Pending |
| ANLX-02 | Phase 8 | Pending |
| ANLX-03 | Phase 8 | Pending |
| ANLX-04 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 82 total
- Mapped to phases: 82
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-13*
*Last updated: 2026-04-13 after roadmap creation — traceability populated*
