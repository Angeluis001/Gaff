# Phase 6 Research: CRM and Reviews Agent

**Completed:** 2026-04-15
**Status:** Research complete, ready for planning

## What Was Researched

### Client lifecycle from completed bookings
- The booking model already has `clientId`, `leadId`, `status`, `fishCaught`, `totalPrice`, and timestamps.
- The client model already supports repeat-guest enrichment with total trips, total spend, preferred species, preferred boat category, communication preference, and tags.
- There is no explicit completed-booking action yet, so Phase 6 should add a completion entrypoint that can safely sync the client record when a trip is marked complete.

### CRM email and scheduling surface
- Resend is already used for booking confirmations, so client lifecycle emails can reuse the same email transport.
- Upstash Redis is already available and was used in Phase 5 for lead follow-up scheduling, so it is a sensible place to store scheduled CRM reminders.
- The phase can schedule anniversary, seasonal, and re-engagement reminders without inventing a new job store.

### Reviews ingestion and moderation
- The reviews table already supports platform, rating, response content, response status, and booking linkage.
- The admin reviews surface already exists, so Phase 6 can extend it with real monitoring data and low-star alerting instead of creating a new console.
- A single polling/sync pipeline can normalize TripAdvisor, Google, and Yelp records into the existing reviews table.

### Admin visibility
- Client and reviews admin pages already render, so Phase 6 can enrich them with real lifecycle and moderation data.
- The admin dashboard and section cards can surface high-priority review alerts without adding another internal route tree.

## Validation Architecture

1. Mark a booking complete.
2. Sync or create the matching client record.
3. Send the post-trip review request email.
4. Schedule client anniversary, seasonal, and re-engagement reminders.
5. Poll review sources and persist normalized review records.
6. Surface low-star alerts in admin.

## Research Outcome

Phase 6 can build on the existing booking, client, and review schemas without adding parallel models. The missing pieces are a safe booking-completion entrypoint, a client-sync helper, a CRM scheduling helper, and a review polling pipeline that updates the existing admin UI.

