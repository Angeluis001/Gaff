# Phase 3: Booking & Payments - Research

**Researched:** 2026-04-14
**Domain:** Next.js 15 booking flow, Stripe hosted Checkout, Stripe webhooks, Resend transactional mail, and Neon-backed availability
**Confidence:** HIGH for current platform patterns and package surface; MEDIUM for exact implementation shape where current project data is incomplete

---

<phase_requirements>
## Phase Requirements

| ID | Description | Planning Impact |
|----|-------------|-----------------|
| BOOK-01 | `/api/booking/availability` returns per-boat, per-day status from database | Requires live DB query layer, fleet seed/sync, and a stable date normalization strategy |
| BOOK-02 | Booking form collects date, boat, trip type, guest count, name, email, phone, special requests | Requires shared form component plus server-side validation |
| BOOK-03 | Stripe checkout opens for a 50% deposit | Requires server-created Checkout session and client redirect |
| BOOK-04 | Stripe webhook updates booking status to `deposit_paid` | Requires verified webhook signature and idempotent booking update |
| BOOK-05 | Booking confirmation email arrives via Resend | Requires post-webhook confirmation mailer |
| BOOK-06 | Booking data saves to Neon | Requires lead + booking persistence before Checkout |
| BOOK-07 | Boat availability is blocked when booking is confirmed | Requires atomic availability reconciliation after payment |
| INTG-01 | Stripe fully wired | Requires server SDK, browser handoff, metadata strategy, and webhook handling |
| INTG-02 | Resend configured with transactional templates | Requires API client, sender identity, and confirmation template path |

</phase_requirements>

---

## Summary

Phase 3 can build directly on the schema and landing work already in the repo, but three gaps must be addressed immediately:

1. **Stripe and Resend packages are not installed yet.** The project currently lacks `stripe`, `@stripe/stripe-js`, and `resend`, so execution must start by adding those dependencies.
2. **The sellable fleet does not exist in Neon yet.** The landing page fleet lives only in `src/lib/landing-data.ts`; without a fleet sync or seed path, `/api/booking/availability` has no real boats to query.
3. **The live booking invariant is not enforced in schema yet.** `boat_availability` exists, but the current file does not define a uniqueness guarantee on `(boat_id, date)`. Phase 3 should harden that if Neon is to be the source of truth for day-level blocking.

The safest architecture is:
- persist a lead and pending booking first,
- create a hosted Stripe Checkout session with booking metadata,
- verify the webhook with Stripe's signing secret,
- in the webhook, update the booking to `deposit_paid`, reconcile `boat_availability`, and send the confirmation email.

This keeps card handling out of the app, gives downstream phases stable booking IDs, and makes duplicate webhook deliveries safe to ignore or reprocess idempotently.

---

## Critical Findings

### 1. Missing dependencies

Current `package.json` does **not** include:
- `stripe`
- `@stripe/stripe-js`
- `resend`

These are required before any real payment or confirmation-mail work begins.

Recommended install set for execution:

```bash
npm install stripe @stripe/stripe-js resend
```

### 2. Current booking schema is close, but not enough by itself

The existing schema already gives Phase 3 most of what it needs:
- `bookings` has `status`, `depositAmount`, `totalPrice`, `stripeSessionId`, and `stripePaymentIntentId`
- `boat_availability` links boats to dates and can point back to a `bookingId`
- `leads` can store source, date preference, group size, and notes

However:
- `boat_availability` currently uses a timestamp-like column shape for day-level state
- the file does not show a uniqueness constraint for one row per boat per day
- there is no existing repository code that syncs the landing fleet into the `boats` table

Execution should decide the day-normalization strategy once and apply it everywhere:
- booking form
- booking API
- availability API
- webhook reconciliation
- confirmation page lookups

### 3. The landing handoff is already there

`src/components/landing/AvailabilityCalendarSection.tsx` already:
- fetches mock availability,
- emits `gaff:booking-started`,
- and opens a placeholder booking shell.

That means Phase 3 does **not** need to invent a new entry point. It should replace the placeholder path with the real booking flow while preserving the current tracking behavior.

### 4. Existing Upstash setup is a sharp edge

`src/lib/ratelimit.ts` already exists and is intended for Phase 3, but Phase 1 explicitly deferred real Upstash credentials. Current local builds have already shown missing Upstash env warnings. Booking routes should therefore:
- use the limiter when credentials are configured,
- but degrade gracefully in local development or preview when credentials are absent,
- rather than crashing route imports on boot.

---

## Official Platform Notes

### Stripe Checkout

Verified from official Stripe docs:
- hosted Checkout sessions support `success_url` and `cancel_url`
- metadata added to the Checkout session is included in webhook events
- metadata can also be copied to the underlying PaymentIntent through `payment_intent_data.metadata`
- webhook signatures should be verified with Stripe's official libraries and the endpoint secret

Recommended usage for this project:
- create a pending booking first
- create the Checkout session with `bookingId`, `leadId`, `boatId`, `tripDate`, and `tripType` metadata
- redirect the browser to the hosted session URL
- treat `checkout.session.completed` as the canonical deposit confirmation trigger

### Next.js Route Handlers

Verified from official Next.js docs:
- App Router `route.ts` handlers use the standard Web `Request` / `Response` APIs

Practical implication:
- the Stripe webhook route can read the raw payload from the request body directly and should avoid JSON parsing before signature verification

### Resend

Verified from official Resend docs:
- `resend.emails.send()` is the primary send API
- Resend also exposes domain management endpoints, which aligns with the build-pack requirement to verify the booking sender identity before production use

Recommended usage for this project:
- create a small `src/lib/resend.ts` wrapper
- centralize the booking sender address and fallback dev behavior there
- send confirmation email only after webhook confirmation succeeds

### Drizzle ORM

Verified from official Drizzle docs:
- PostgreSQL inserts support `.returning()`
- Drizzle supports multi-statement `db.transaction(...)`

Practical implication:
- pending lead + booking creation can return fresh inserted IDs cleanly
- payment confirmation can wrap booking update plus availability reconciliation in one transaction

---

## Recommended Architecture

### Server files

```text
src/app/api/booking/availability/route.ts
src/app/api/booking/route.ts
src/app/api/stripe/checkout/route.ts
src/app/api/stripe/webhook/route.ts
src/lib/stripe.ts
src/lib/resend.ts
src/lib/booking/
  availability.ts
  create-booking.ts
  fleet-sync.ts
  pricing.ts
  validation.ts
```

### Client files

```text
src/app/booking/page.tsx
src/app/booking/confirmation/page.tsx
src/components/booking/BookingForm.tsx
src/components/booking/DatePicker.tsx
src/components/booking/BoatSelector.tsx
src/components/landing/AvailabilityCalendarSection.tsx
```

### Flow

1. Visitor chooses date and boat from landing or `/booking`.
2. Shared booking form validates required fields client-side and server-side.
3. `/api/booking` upserts/creates lead data and creates a pending booking.
4. `/api/stripe/checkout` creates a hosted Checkout session for the deposit amount.
5. Browser redirects to Stripe Checkout.
6. Stripe webhook verifies signature, marks booking `deposit_paid`, updates `stripePaymentIntentId`, blocks the boat/day, and triggers confirmation email.
7. `/booking/confirmation` resolves the booking summary from session metadata and Neon state.

---

## Data and Pricing Guidance

### Fleet bootstrap

Because the DB fleet is not yet visible in code, execution should establish a canonical sync path. The lightest-weight option is to derive DB seed records from the existing landing catalog:
- slug -> `boats.slug`
- name -> `boats.name`
- category -> `boats.category`
- capacity -> parsed integer from the landing copy
- price labels -> normalized half/full-day price fields

That keeps Phase 2 content and Phase 3 availability aligned instead of duplicating fleet definitions manually.

### Deposit policy

The product and build pack consistently describe a **50% deposit** flow. The implementation should:
- calculate both `totalPrice` and `depositAmount` server-side
- never trust client-sent deposit amounts
- persist those amounts on the booking row before Checkout starts

---

## Pitfalls

### Pitfall 1: webhook parsing before signature verification

If the webhook route parses JSON before signature verification, Stripe signature checking can fail because the exact raw payload is required.

### Pitfall 2: duplicate webhook effects

Stripe can retry webhook delivery. Without idempotent handling, the app can:
- send duplicate emails
- write duplicate availability rows
- accidentally re-run booking state transitions

Execution should key off stable Stripe event IDs and/or current booking state.

### Pitfall 3: no unique day-level availability invariant

If the DB allows multiple `boat_availability` rows for the same boat/day, the API can return conflicting status and double-booking protection becomes fragile.

### Pitfall 4: trusting client prices

The booking form should never submit the amount the user will pay as a source of truth. Server-side price lookup must derive totals from the selected boat and trip type.

### Pitfall 5: sending confirmation before payment is real

If Resend fires immediately after booking draft creation, customers will receive false confirmations for abandoned checkouts. Confirmation mail must happen only after webhook confirmation.

### Pitfall 6: local route failures caused by missing Upstash

Import-time Redis setup can make booking routes brittle in local development if rate limiting is hard-required. The limiter should be optional or guarded.

### Pitfall 7: timezone drift on trip dates

The product is day-based, but the schema currently stores date-like values in timestamp columns. Execution must normalize dates consistently or bookings near midnight will drift.

---

## Primary Recommendation

Split Phase 3 into two plans:

1. **03-01 foundation and booking persistence**
   - install dependencies
   - harden booking schema/availability invariant if needed
   - establish fleet sync
   - build `/api/booking/availability`
   - build shared booking form and `/api/booking`

2. **03-02 payments and confirmation**
   - create Stripe Checkout sessions
   - verify Stripe webhooks
   - block availability on confirmed payment
   - build confirmation page
   - send Resend confirmation email
   - close analytics TODOs for `booking_completed`

This split matches the roadmap, keeps the DB and UI foundation separate from the external integrations, and makes it easy to verify each layer in isolation before money movement is introduced.

---

## Sources

### Primary
- Local codebase: `package.json`, `src/lib/db/schema/*`, `src/types/booking.ts`, `src/lib/ratelimit.ts`, `src/components/landing/AvailabilityCalendarSection.tsx`
- Official Stripe docs verified 2026-04-14
- Official Resend docs verified 2026-04-14
- Official Next.js route handler docs verified 2026-04-14
- Official Drizzle ORM docs verified 2026-04-14

### Project spec
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `c:\Users\angel\Downloads\GAFF_ALL_FISHING_BUILD_PACK_1.md`

---

## Metadata

**Confidence breakdown:**
- Payment and email platform shape: HIGH
- Current repo integration points: HIGH
- Fleet bootstrap strategy: MEDIUM
- Date-normalization approach: MEDIUM

**Research date:** 2026-04-14
**Valid until:** 2026-05-14
