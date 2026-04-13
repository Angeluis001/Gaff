# GAFF All Fishing Los Cabos

## What This Is

A full-stack digital platform for GAFF All Fishing, a sport fishing charter company in Los Cabos, B.C.S., México. The platform serves US tourists seeking deep-sea fishing experiences via a premium landing page with real-time booking, and automates the entire customer lifecycle — from discovery through post-trip follow-up — using a suite of 7 AI agents. Built by AUREON Digital Agency.

## Core Value

A US tourist discovers GAFF on Google or Instagram, checks real-time boat availability, books and pays a deposit online without speaking to anyone — and the AI handles follow-up from that moment forward.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Stage 1 — Landing Page:**
- [ ] Premium landing page (Next.js 15 + Framer Motion) with hero video, fleet showcase, fishing seasons, testimonials, crew, conservation, and FAQ sections
- [ ] Real-time boat availability calendar with color-coded status (available/limited/booked) and per-boat filtering
- [ ] Online booking flow with date/boat selection, contact form, and Stripe deposit payment (50%)
- [ ] Botpress web chat widget embedded on landing page
- [ ] Bilingual support (EN primary, ES secondary)
- [ ] SEO-optimized for USA market (schema.org, OG tags, target keywords: "cabo san lucas fishing", "sport fishing cabo", etc.)
- [ ] Lighthouse Performance > 90, LCP < 2.5s, CLS < 0.1
- [ ] Admin dashboard (NextAuth.js) with leads, clients, bookings, fleet, agents, marketing, SEO, reviews, settings pages

**Stage 2 — AI Agents:**
- [ ] Bot Agent: conversational booking + FAQ via Botpress (web) and OpenClaw (WhatsApp)
- [ ] Lead Agent: auto-classify leads (hot/warm/cold via GPT-4o-mini), automated follow-up sequences (email + WhatsApp)
- [ ] Client Agent: CRM with trip history, segmentation, personalized promotions triggered by anniversaries/seasons/social posts
- [ ] SEO Agent: automated blog posts, fishing reports, landing pages per species, keyword tracking, meta optimization
- [ ] Marketing Agent: social content calendar, auto-publish to Instagram/Facebook/TikTok via Meta APIs, engagement management, Meta Ads management
- [ ] Reviews Agent: monitor TripAdvisor/Google/Yelp, generate draft responses (human-approved before publish), post-trip review solicitation
- [ ] Analytics Agent: real-time dashboard KPIs, daily/weekly/monthly automated reports, intelligent alerts

**Stage 3 — Integrations:**
- [ ] Stripe payments (checkout sessions + webhooks, 50% deposit model)
- [ ] Meta Graph API (Instagram + Facebook publish + insights)
- [ ] TikTok for Business API (video publishing + pixel)
- [ ] TripAdvisor Content API (reviews monitoring)
- [ ] Resend transactional email (booking confirmation, lead follow-up, post-trip review request)
- [ ] Cloudinary media management (image/video optimization)
- [ ] OpenAI GPT-4o + GPT-4o-mini (all agent intelligence)
- [ ] OpenClaw WhatsApp gateway (self-hosted, Baileys protocol)
- [ ] Upstash Redis (rate limiting, caching, Vercel Cron queues)
- [ ] Google Analytics 4 + Search Console + Meta Pixel + TikTok Pixel

### Out of Scope

- WhatsApp Business API (official Meta) — deferred; OpenClaw covers launch needs without per-message costs
- Stripe Connect split payments to captains — deferred to future milestone
- SMS via Twilio — backup channel only, not in v1
- Guest-facing mobile app — web-first launch
- Multi-location support — Los Cabos only for v1
- Online balance payment (day-of) — deposit only online; balance collected in person

## Context

- **Competitor:** piscessportfishing.com — GAFF must beat it on design, animation quality, real-time booking UX, and AI automation.
- **Target market:** US tourists (25-55), groups/corporate, experienced anglers, families — acquired via Google SEO, Instagram, TikTok, TripAdvisor, and WhatsApp.
- **Departure point:** Cabo San Lucas Marina (22.8905°N, -109.9167°W).
- **Fleet:** 4 categories — Standard, Midsize, Large, Luxury — each with half-day and full-day pricing.
- **Trip hours:** Half day 6AM–2PM, Full day 6AM–4PM.
- **Booking model:** 50% deposit online via Stripe; free cancellation up to 48h before.
- **Conservation:** Catch-and-release policy for Marlin/Sailfish; certified by GrayFishTag and IGFA.

## Constraints

- **Tech Stack**: Next.js 15 + TypeScript + Tailwind CSS + Drizzle ORM + Neon PostgreSQL — specified in build pack, not negotiable
- **Hosting**: Vercel (Pro) for Next.js app; Railway/DigitalOcean for OpenClaw WhatsApp gateway
- **AI**: OpenAI GPT-4o as primary LLM for all agents; GPT-4o-mini for high-volume classification tasks
- **Domain**: gaffallfishingloscabos.com
- **Language**: English primary (USA market), Spanish secondary (bilingual UI)
- **Budget (infra)**: ~$140–350 USD/month estimated (Vercel + Neon + Upstash + Resend + OpenAI + OpenClaw hosting)
- **Performance**: Lighthouse > 90, LCP < 2.5s — video hero must be < 5MB optimized

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Botpress for web chat | Visual flow builder, free tier, embeddable widget, better landing UX than OpenClaw WebChat | — Pending |
| OpenClaw for WhatsApp | Open source, no per-message cost via Baileys, extensible skills system | — Pending |
| Neon (serverless PostgreSQL) | Vercel-native, branching for dev/staging, connection pooling | — Pending |
| Drizzle ORM | Type-safe, lightweight, pairs well with Neon serverless | — Pending |
| Vercel Cron via Upstash | Scheduled agent tasks (follow-up sequences, SEO reports, social publishing) without a separate job server | — Pending |
| 50% deposit model | Industry standard for charter bookings; reduces no-shows while lowering booking friction | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-13 after initialization*
