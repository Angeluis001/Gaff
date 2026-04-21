# GAFF All Fishing — Functional UAT Test Plan

**Generated:** 2026-04-19  
**Scope:** All 8 phases — end-to-end functional verification  
**Environment:** Production (`gaffallfishingloscabos.com`) unless noted  

---

## Summary

| Phase | Status | Tests | Prerequisites |
|-------|--------|-------|---------------|
| 1. Foundation | ✅ Completed | 4 | Local env |
| 2. Landing Page | ✅ Completed (hardening deferred) | 10 | Browser |
| 3. Booking & Payments | ⚠️ Pending live verification | 8 | Stripe test keys, DB |
| 4. Admin Dashboard | ✅ Completed | 9 | Admin credentials |
| 5. Chat & Lead Agent | ✅ Completed | 7 | Botpress, OpenClaw, OpenAI |
| 6. CRM & Reviews Agent | ✅ Completed | 6 | Completed booking in DB |
| 7. SEO & Marketing Agents | ✅ Completed | 7 | Meta tokens, OpenAI |
| 8. Analytics Agent | ✅ Completed | 5 | Cron env, Resend |

---

## Session A — Foundation Smoke Test

**Prerequisites:** Node.js, `.env.local` configured with DATABASE_URL, UPSTASH_REDIS_REST_URL, SENTRY_DSN  
**Run in:** Local dev environment

### A-1: Dev server starts clean
- Run: `npm run dev`
- Expected: Server starts at `localhost:3000` with no TypeScript errors or lint warnings in console

### A-2: Type-check and lint pass
- Run: `npm run type-check && npm run lint`
- Expected: Both commands exit 0 with no errors

### A-3: Database schema is live
- Run: `npm run db:push` (or `drizzle-kit push`)
- Expected: All Drizzle migrations apply to Neon without errors; all tables exist when queried

### A-4: Sentry captures errors
- Navigate to any page in dev; trigger a test error (console or manual throw)
- Expected: Error appears in Sentry dashboard within 60 seconds

---

## Session B — Landing Page (Browser)

**Prerequisites:** Production URL live, or `npm run build && npm run start`  
**Run in:** Chrome DevTools open

### B-1: Hero section loads with animation
- Navigate to `/`
- Expected: Video hero loads (< 5MB via network tab), Framer Motion headline animates on arrival, two CTAs ("Book Now" / "Check Availability") visible on both mobile (375px) and desktop (1440px)

### B-2: Fleet section — cards and carousel
- Scroll to Fleet section
- Expected: All 4 boat categories shown with pricing; 3D hover effect active on desktop; embla carousel visible and swipeable on mobile

### B-3: Availability calendar renders
- Scroll to Availability / Booking section
- Expected: Calendar shows day-level status colors (available / booked / unavailable); no JS console errors

### B-4: Calendar date click opens booking modal
- Click an available day on the calendar
- Expected: Booking modal opens pre-filled with the selected date

### B-5: Bilingual toggle works
- Click the ES/EN language toggle in the navbar
- Expected: All visible text switches between English and Spanish without page reload; toggle persists on scroll

### B-6: FAQ "Chat with us" opens Botpress widget
- Scroll to FAQ section; click "Chat with us" link
- Expected: Botpress chat widget opens (requires `NEXT_PUBLIC_BOTPRESS_*` env vars set in production)

### B-7: SEO metadata in page source
- View source of `/`
- Expected: JSON-LD `FishingCharter` schema present; `og:title`, `og:image`, `og:description` tags present; `twitter:card` tag present

### B-8: Sitemap and robots
- Navigate to `/sitemap.xml` and `/robots.txt`
- Expected: Both return 200 with valid content; sitemap lists main URLs

### B-9: Lighthouse Performance score
- Run Lighthouse in Chrome DevTools on production URL
- Expected: Performance > 90; LCP < 2.5s; CLS < 0.1

### B-10: Analytics events fire
- Open Chrome DevTools > Network tab, filter by `collect` (GA4) or `events`
- Scroll through the page and click a CTA
- Expected: GA4 pageview fires on load; `booking_started` event fires when booking modal opens

---

## Session C — Booking & Payments

**Prerequisites:** `STRIPE_SECRET_KEY` (test mode), `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `RESEND_API_KEY` configured  
**Run in:** Browser + Stripe Dashboard test mode  
**⚠️ This session is REQUIRED before go-live — manual verification was not run during implementation**

### C-1: Availability API returns correct status
- Call `GET /api/availability?date=YYYY-MM-DD` for a date without bookings
- Expected: JSON response with per-boat availability; status = `available` for unbooked boats

### C-2: Availability API blocks booked boats
- Manually insert a booking in DB with status `deposit_paid` for a boat+date
- Call `GET /api/availability?date=YYYY-MM-DD`
- Expected: That boat's status = `booked`

### C-3: Booking form validation
- Open booking modal; submit without filling required fields
- Expected: Validation errors appear for: date, boat, trip type, guest count, name, email, phone

### C-4: Booking form creates pending booking
- Fill all fields and submit
- Expected: `POST /api/bookings` returns 201; record appears in DB with `status = pending`

### C-5: Stripe checkout session opens
- Continue from C-4; form should redirect to hosted Stripe Checkout
- Expected: Stripe Checkout page loads with correct amount (50% of boat price); customer email pre-filled

### C-6: Completed Stripe payment updates booking
- Use Stripe test card `4242 4242 4242 4242` to complete payment
- Expected: Redirected to `/booking/confirmation?session_id=...`; confirmation page shows trip summary

### C-7: Webhook updates booking status and blocks availability
- After C-6, check DB and availability API
- Expected: `bookings.status` = `deposit_paid`; `boat_availability` row has `is_blocked = true` for that boat+date within 30 seconds of payment

### C-8: Confirmation email delivered
- Check email inbox used in C-5
- Expected: Booking confirmation email arrives within 2 minutes with trip summary via Resend

---

## Session D — Admin Dashboard

**Prerequisites:** Admin credentials configured in DB (`NEXTAUTH_SECRET` set), production or local build  
**Run in:** Browser (incognito to verify auth state)

### D-1: Login page renders and unauthenticated redirect
- Navigate to `/admin/dashboard` without a session
- Expected: Redirected to `/admin/login`

### D-2: Login with valid credentials
- Submit email + password at `/admin/login`
- Expected: Redirected to `/admin/dashboard`; session persists after page reload and across tabs

### D-3: Invalid login rejected
- Submit wrong password
- Expected: Error message shown; no session created

### D-4: Dashboard KPI widgets show live data
- On `/admin/dashboard`, observe KPI widgets
- Expected: Bookings count, revenue total, leads by status, and fleet occupancy are populated from DB (not zeros if test data exists)

### D-5: Leads table — search and filter
- Navigate to `/admin/leads`
- Expected: Table loads with leads; search filters by name/email; status filter narrows results; pagination works

### D-6: Clients table and detail page
- Navigate to `/admin/clients`; click a client row
- Expected: Client detail page shows trip history and activity timeline

### D-7: Bookings calendar
- Navigate to `/admin/bookings`
- Expected: Calendar view shows per-boat per-day status with correct colors

### D-8: Fleet management — add and edit boat
- Navigate to `/admin/fleet`; toggle a maintenance window
- Expected: Fleet page reflects the change without requiring page reload; the affected date shows as unavailable in the main calendar

### D-9: All 10 admin routes render without errors
- Navigate to: `/admin/dashboard`, `/admin/leads`, `/admin/clients`, `/admin/bookings`, `/admin/fleet`, `/admin/agents`, `/admin/marketing`, `/admin/seo`, `/admin/reviews`, `/admin/settings`
- Expected: All routes return 200 with content; no runtime errors in console

---

## Session E — Chat & Lead Agent

**Prerequisites:** `OPENAI_API_KEY` set; Botpress workspace configured; OpenClaw server running  
**Run in:** Browser + WhatsApp test number

### E-1: Botpress widget loads on landing page
- Navigate to `/` with Botpress env vars set
- Expected: Chat widget icon appears in bottom-right corner with GAFF color theme; opens on click

### E-2: Botpress FAQ answers match GAFF knowledge base
- Open the Botpress widget; ask "What fish can I catch in Los Cabos?"
- Expected: Response uses GAFF-specific FAQ content (not generic answer)

### E-3: WhatsApp message reaches OpenClaw
- Send a WhatsApp message to the GAFF WhatsApp number: "I want to book a fishing trip"
- Expected: Automated response arrives within 30 seconds from the `gaff-booking` agent

### E-4: Lead captured from web form
- Submit the contact/inquiry form on the landing page
- Expected: Lead record appears in DB with `source = web`, contact info, `status = new` within 60 seconds

### E-5: Lead captured from WhatsApp
- After E-3, check the DB
- Expected: Lead record exists with `source = whatsapp`, phone number, `status = new`

### E-6: Lead Agent classifies leads
- Trigger cron: `POST /api/cron/leads/classify` with correct `CRON_SECRET` header
- Expected: Unclassified leads receive a `classification` of `hot`, `warm`, or `cold` within 5 minutes; `lead_activities` table has a new row per lead

### E-7: Hot lead alert appears in admin dashboard
- Create a lead with classification `hot` and set `last_contacted_at` to > 2 hours ago
- Navigate to `/admin/dashboard`
- Expected: Hot lead alert banner or badge visible on the dashboard

---

## Session F — CRM & Reviews Agent

**Prerequisites:** At least one booking with `status = completed` in DB; `RESEND_API_KEY` set; `OPENAI_API_KEY` set

### F-1: Completed booking creates client record
- Manually update a booking to `status = completed` in DB (or trigger via webhook)
- Expected: `clients` table has a new or enriched record for that customer with trip history

### F-2: Post-trip review request email sent
- 24 hours after a booking reaches `completed` (simulate by running the cron: `POST /api/cron/reviews/poll`)
- Expected: Review request email lands in customer inbox with direct TripAdvisor and Google links

### F-3: Anniversary email queued
- Check `lead_activities` or `scheduled_emails` table for a booking that completed ~1 year ago (or seed test data)
- Expected: Anniversary email trigger is scheduled for the 1-year date

### F-4: Review polling discovers new reviews
- Add a test review to the mock or staging TripAdvisor/Google data (or trigger the cron manually)
- Trigger: `POST /api/cron/reviews/poll`
- Expected: New review appears in admin `/admin/reviews` page within 60 seconds of cron run

### F-5: GPT-4o draft response generated
- After F-4, check the review record in admin
- Expected: Each new review has a draft response pre-populated via GPT-4o and visible in the admin reviews page

### F-6: Low-star alert fires
- Seed or create a review with rating ≤ 3 in the DB
- Navigate to `/admin/reviews`
- Expected: High-priority alert visible for the low-star review; also check admin dashboard for alert badge

---

## Session G — SEO & Marketing Agents

**Prerequisites:** `OPENAI_API_KEY` set; `META_ACCESS_TOKEN` set; Vercel Cron secrets configured

### G-1: SEO Agent generates weekly blog post
- Trigger: `POST /api/cron/seo` with correct `CRON_SECRET` header
- Expected: New blog post record in DB with English title targeting primary keyword; visible in `/admin/seo`

### G-2: Fishing report auto-generated on trip completion
- Complete a booking (set `status = completed`)
- Expected: Fishing report record auto-created in DB within 60 seconds; visible in `/admin/seo`

### G-3: Keyword ranking report available
- Navigate to `/admin/seo`
- Expected: Keyword ranking table visible comparing target keywords; populated after at least one cron run

### G-4: Marketing content calendar generated
- Trigger: `POST /api/cron/marketing` with correct `CRON_SECRET` header
- Expected: Weekly content calendar visible in `/admin/marketing` with captions and hashtags for Instagram, Facebook, TikTok

### G-5: Instagram/Facebook post queued for publishing
- Approve a post in `/admin/marketing`
- Expected: Post enters the publishing queue; Meta Graph API call attempted (check logs or Vercel function logs)

### G-6: TikTok Pixel conversion event fires
- Complete a booking in Stripe test mode (Session C)
- Expected: TikTok Pixel `CompletePayment` event fires (verify via TikTok Pixel Helper browser extension)

### G-7: Engagement drafts available
- Navigate to `/admin/marketing`
- Expected: Comment engagement drafts section shows GPT-generated reply templates for recent social comments

---

## Session H — Analytics Agent

**Prerequisites:** `RESEND_API_KEY` set; `ADMIN_EMAIL` set; DB populated with bookings/leads data

### H-1: KPI dashboard populated without manual refresh
- Navigate to `/admin/dashboard`
- Expected: Bookings count, revenue, leads by status, and fleet occupancy widgets show current DB data automatically

### H-2: Daily report email delivered
- Trigger: `POST /api/cron/analytics` with `type=daily` param and correct `CRON_SECRET`
- Expected: Daily report email arrives at `ADMIN_EMAIL` within 2 minutes with previous-day bookings, leads captured, and revenue totals

### H-3: Weekly report email delivered
- Trigger: `POST /api/cron/analytics` with `type=weekly`
- Expected: Weekly report email arrives at `ADMIN_EMAIL` with marketing performance and SEO keyword movements

### H-4: Boat idle alert fires
- Seed a boat with no bookings for the past 3 days
- Trigger: `POST /api/cron/analytics` with `type=alerts`
- Expected: Alert "Boat idle > 3 days" appears in admin dashboard alert feed

### H-5: Lead conversion drop alert fires
- Manipulate lead data so conversion rate drops > 20% vs. prior period
- Trigger the alerts cron
- Expected: Alert "Lead conversion rate drop > 20%" appears in admin dashboard alert feed

---

## Recommended Execution Order

1. **Session A** — Local, no deployment needed. Run first to confirm build health.
2. **Session B** — Browser against production deploy. Run before any customer traffic.
3. **Session C** — **CRITICAL before go-live.** Run with Stripe test keys. No live money until this passes.
4. **Session D** — Admin dashboard. Requires an admin user seeded in the DB.
5. **Sessions E–H** — AI agents. Require all third-party env vars set. Can be run in parallel once D passes.

## Known Deferred Items (from implementation notes)

| Item | Phase | Why Deferred |
|------|-------|-------------|
| Lighthouse Performance > 90 | 2 | Not measured in preview deploy |
| LCP < 2.5s, CLS < 0.1 | 2 | Requires production Lighthouse run |
| GA4 / Meta Pixel event verification | 2 | Requires real tracking IDs in env |
| Full Stripe checkout flow | 3 | No Stripe keys in build environment |
| Resend email delivery | 3 | No Resend key in build environment |
| Live Neon write from booking form | 3 | No DATABASE_URL in build environment |
| WhatsApp OpenClaw gateway | 5 | Requires deployed OpenClaw server |
