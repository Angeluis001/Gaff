# Phase 6: CRM and Reviews Agent - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 turns completed trips into lasting guest relationships and moderates public reputation. It owns the client lifecycle triggered by completed bookings, the review-request and re-engagement email flows, and the review polling/response workflow for TripAdvisor, Google, and Yelp.

This phase extends the data and admin surfaces created in earlier phases. It does not replace booking or lead automation; it builds on those records and upgrades them into CRM and reputation workflows.

</domain>

<decisions>
## Implementation Decisions

### Client lifecycle
- **D-01:** Treat booking completion as the canonical trigger for CRM enrichment.
- **D-02:** Reuse the existing `clients` table as the canonical guest profile and update it from completed bookings instead of creating a second CRM profile table.
- **D-03:** Reuse Upstash Redis for scheduled client reminders where a durable background job store is needed.

### Review workflow
- **D-04:** Reuse the existing `reviews` table as the canonical review store across TripAdvisor, Google, and Yelp.
- **D-05:** Normalize provider records into a single moderation model with draft response content and alert priority.
- **D-06:** Surface low-star reviews in the admin UI as a visible operational warning, not just as hidden data.

### Admin visibility
- **D-07:** Extend the existing clients and reviews admin pages rather than creating separate CRM dashboards.
- **D-08:** Keep responses human-approved before publishing, even if the agent drafts them automatically.

### Claude's Discretion
- Whether the booking-completion entrypoint is an admin action, API route, or cron reconciliation path, as long as it is safe and deterministic
- Exact CRM reminder cadence for anniversary and re-engagement scheduling, as long as it is clearly recorded
- Whether review polling uses provider-specific fetchers, env-driven URLs, or a shared abstraction, as long as the admin data stays normalized

</decisions>

<specifics>
## Specific Ideas

- `src/lib/db/schema/clients.ts` already has the profile fields needed for enrichment.
- `src/lib/db/schema/bookings.ts` already links bookings to both leads and clients.
- `src/lib/db/schema/reviews.ts` already supports response drafts and review metadata.
- `src/lib/admin/clients.ts` and `src/lib/admin/reviews.ts` already power the admin surfaces Phase 6 needs to extend.
- `src/app/admin/(protected)/clients/page.tsx` and `src/app/admin/(protected)/reviews/page.tsx` already exist and can surface the new data directly.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap
- `.planning/PROJECT.md` - product constraints and platform choices
- `.planning/REQUIREMENTS.md` - CRM-01 through CRM-05 and REVW-01 through REVW-03
- `.planning/ROADMAP.md` - Phase 6 goal, dependency on Phase 5, and success criteria
- `.planning/STATE.md` - current milestone position and execution readiness

### Prior phase outputs Phase 6 must honor
- `.planning/phases/05-chat-lead-agent/05-CONTEXT.md` - lead pipeline and alert contracts
- `.planning/phases/05-chat-lead-agent/05-03-SUMMARY.md` - hot-lead alert patterns that Phase 6 should keep aligned with admin

### Existing code Phase 6 must extend
- `src/lib/db/schema/bookings.ts` - booking completion source of truth
- `src/lib/db/schema/clients.ts` - client CRM source of truth
- `src/lib/db/schema/reviews.ts` - review moderation source of truth
- `src/lib/admin/clients.ts` - client admin read model
- `src/lib/admin/reviews.ts` - review admin read model
- `src/app/admin/(protected)/clients/page.tsx` - client admin surface
- `src/app/admin/(protected)/reviews/page.tsx` - review admin surface
- `src/lib/resend.ts` - transactional email transport
- `src/lib/redis.ts` - scheduling store

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The client and review admin views already render and can absorb richer state without route rewrites.
- The booking webhook already proves that transactional side effects can be performed safely after a state transition.
- Resend and Redis are already wired into the repo and can support CRM reminders and review requests.

### Gaps Phase 6 must fill
- No booking-completion entrypoint exists yet.
- No client-sync helper exists yet.
- No CRM reminder scheduler exists yet.
- No review polling/sync job exists yet.
- No low-star review alert summary exists in the admin views yet.

### Integration Points
- Booking completion should enrich clients and can trigger review follow-up.
- Review polling should persist normalized records to the same table the admin surface already reads.
- The admin pages should remain the source of truth for ops visibility.

</code_context>

<deferred>
## Deferred Ideas

- Full review publishing automation without human approval
- Detailed sentiment scoring
- Cross-channel client segmentation beyond the first enrichment pass
- Third-party CRM export integrations

</deferred>

---

*Phase: 06-crm-reviews-agent*
*Context gathered: 2026-04-15*
