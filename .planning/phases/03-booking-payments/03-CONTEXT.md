# Phase 3: Booking & Payments - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn the Phase 2 read-only booking intent into a real booking flow. A visitor must be able to select a date and boat, fill the required trip details, create a pending booking in Neon, pay a 50% deposit through Stripe Checkout, receive a confirmation email through Resend, and have the boat blocked from double-booking once payment is confirmed.

This phase owns the public booking flow only. It does not build the admin dashboard, post-trip lifecycle, CRM automations, or chat-led booking orchestration.

</domain>

<decisions>
## Implementation Decisions

### Booking UX
- **D-01:** Use a shared booking form component in `src/components/booking/BookingForm.tsx` so the same validated form can power the landing handoff and the standalone `/booking` route.
- **D-02:** The landing availability CTA must pass `date` and `boat` into the real booking flow so the visitor sees a prefilled experience instead of a dead-end placeholder.
- **D-03:** Keep Stripe in hosted Checkout mode for Phase 3. The app creates the session server-side and redirects the user to Stripe; card data must never touch GAFF application code.

### Booking persistence
- **D-04:** `/api/booking/availability` becomes the source of truth for live booking availability. The existing `/api/landing/availability` route remains Phase 2-only and must not power the real booking flow.
- **D-05:** The app creates a lead record plus a pending booking before Checkout starts, so Stripe metadata and downstream automations can reference a stable `bookingId` and `leadId`.
- **D-06:** Boat blocking happens only after Stripe payment confirmation. The webhook updates booking status to `deposit_paid`, stores Stripe IDs, and reconciles `boat_availability` atomically.
- **D-07:** Webhook handling must be idempotent. Replayed Stripe events must not create duplicate bookings, duplicate availability blocks, or duplicate confirmation emails.

### Email and integrations
- **D-08:** Resend sends the customer confirmation email only after the webhook confirms payment, not when the pending booking is created.
- **D-09:** Public booking routes should use the existing rate-limit foundation from Phase 1 where credentials exist, but local development must still boot cleanly when Upstash credentials are absent.

### Claude's Discretion
- Exact component composition for the booking page and confirmation page
- Whether the landing handoff uses a modal, a side panel, or a route transition, as long as the selected date and boat stay prefilled
- Whether confirmation email markup is plain HTML or React email JSX
- Whether fleet seed/sync runs via a lightweight helper, bootstrap route logic, or a dedicated script, as long as Phase 3 has real boats to sell

</decisions>

<specifics>
## Specific Ideas

- The build pack specifies `src/app/api/booking/route.ts`, `src/app/api/stripe/checkout/route.ts`, `src/app/api/stripe/webhook/route.ts`, `src/app/booking/page.tsx`, and `src/app/booking/confirmation/page.tsx` as the public booking surface. Follow that shape unless there is a compelling implementation reason not to.
- The current landing already emits `gaff:booking-started` and already has analytics TODOs for `booking_completed` and `lead_captured`; Phase 3 should close those TODOs instead of creating a second event vocabulary.
- The current database schema already contains `boats`, `bookings`, `boat_availability`, `leads`, and `clients`, so Phase 3 should build on that schema rather than inventing a parallel booking store.
- The current fleet shown on the landing lives in `src/lib/landing-data.ts`, not in Neon. Phase 3 must bridge that gap before live booking can work.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and acceptance scope
- `.planning/PROJECT.md` - core business constraints and stack decisions
- `.planning/REQUIREMENTS.md` - BOOK-01 through BOOK-07 and INTG-01 through INTG-02
- `.planning/ROADMAP.md` - Phase 3 goal, dependencies, and success criteria
- `.planning/STATE.md` - current project position after Phase 2 preview verification

### Prior phase context and code decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` - schema organization and DB wiring decisions
- `.planning/phases/01-foundation/01-02-SUMMARY.md` - Neon push status and Upstash/Sentry deferrals
- `.planning/phases/02-landing-page/02-04-SUMMARY.md` - current landing behavior, analytics bridge, and deferred Phase 2 hardening

### Existing code that Phase 3 must extend
- `src/lib/db/index.ts` - Drizzle Neon connection
- `src/lib/db/schema/enums.ts` - booking and trip enums already in use
- `src/lib/db/schema/boats.ts` - boats table structure
- `src/lib/db/schema/bookings.ts` - bookings table structure
- `src/lib/db/schema/availability.ts` - boat availability table structure
- `src/lib/db/schema/leads.ts` - lead capture table structure
- `src/types/booking.ts` - existing booking form and booking types
- `src/lib/landing-data.ts` - current fleet catalog and mock availability source
- `src/components/landing/AvailabilityCalendarSection.tsx` - current booking-start handoff behavior
- `src/lib/analytics.ts` - Phase 3 analytics TODOs
- `src/lib/ratelimit.ts` - booking route rate-limit foundation

### Build pack
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md` - folder layout, booking flow, Stripe, Resend, and env guidance

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/booking.ts` already defines the booking form payload shape expected by the UI.
- `src/lib/db/schema/*.ts` already models the core booking tables and enums in Neon.
- `src/lib/ratelimit.ts` already reserves an Upstash-backed limiter for booking routes.
- `src/components/landing/AvailabilityCalendarSection.tsx` already has the user interaction point where the real booking flow should take over.

### Established Patterns
- App Router route handlers are already used for public JSON endpoints.
- Shared logic is kept in `src/lib/` and typed UI contracts live in `src/types/`.
- Environment variables are documented in `.env.example` by phase.
- Analytics uses explicit browser events rather than implicit DOM scraping.

### Integration Points
- Landing page handoff: replace the placeholder booking CTA path without breaking Phase 2 UX.
- Stripe: create Checkout sessions from server routes and verify webhooks on the server.
- Resend: send confirmation mail after webhook confirmation.
- Neon: store leads, pending bookings, confirmed deposit state, and boat availability.
- Upstash: apply rate limiting where credentials exist, but do not make local dev unusable.

</code_context>

<deferred>
## Deferred Ideas

- Full cancellation, refund, and rebooking self-service flows
- Balance payment collection on trip day
- Botpress and WhatsApp-driven booking orchestration
- Admin-side booking management UI
- Coupon codes, upsells, and split payments

</deferred>

---

*Phase: 03-booking-payments*
*Context gathered: 2026-04-14*
