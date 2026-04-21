# Phase 7: SEO and Marketing Agents - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 automates GAFF's content engine. It owns the SEO Agent that generates weekly blog content and fishing reports, the marketing content calendar, and the publishing workflows that push approved social posts to Meta and TikTok.

This phase does not change the landing page design or booking flow. It extends the existing admin SEO and marketing areas with real generated content, publishing state, and keyword reporting.

</domain>

<decisions>
## Implementation Decisions

### SEO content
- **D-01:** Use a dedicated `seo_posts` table as the canonical store for generated blog posts and fishing reports.
- **D-02:** Treat completed trips as the trigger for fishing report generation, while weekly keyword-driven blog posts remain on a cron cadence.
- **D-03:** Keep SEO generation server-side so the admin surface only reads generated output and report summaries.

### Marketing publishing
- **D-04:** Reuse the existing `marketing_posts` table as the canonical store for the content calendar and publish state.
- **D-05:** Use Meta Graph API for Instagram/Facebook publishing and TikTok for Business API for TikTok publishing.
- **D-06:** Keep a human-approval step for posts before publish, even when the content is generated automatically.

### Admin visibility
- **D-07:** Extend the existing SEO and marketing admin pages instead of creating new route groups.
- **D-08:** Surface content status, scheduled publish times, and performance summaries in the admin UI so the agents stay operationally visible.

### Claude's Discretion
- Exact content-generation prompts and keyword selection rules
- Whether the SEO report is stored as rows or a summary record, as long as admin can render it
- Whether social publish helpers are grouped by platform or abstracted behind one helper layer, as long as the cron entrypoints are clear

</decisions>

<specifics>
## Specific Ideas

- `src/app/admin/(protected)/seo/page.tsx` already expects a content/report surface.
- `src/app/admin/(protected)/marketing/page.tsx` already expects a calendar and status surface.
- `src/lib/db/schema/marketing.ts` already stores content, hashtags, status, scheduling, and engagement.
- `src/lib/admin/seo.ts` and `src/lib/admin/marketing.ts` already provide the basic admin read models.
- `src/lib/analytics.ts` already has booking- and conversion-event patterns that can inform social publishing telemetry.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap
- `.planning/PROJECT.md` - product constraints and platform choices
- `.planning/REQUIREMENTS.md` - SEOAG-01 through SEOAG-04, MKTG-01 through MKTG-04, INTG-04, INTG-05
- `.planning/ROADMAP.md` - Phase 7 goal, dependency on Phase 6, and success criteria
- `.planning/STATE.md` - current milestone position and execution readiness

### Prior phase outputs Phase 7 must honor
- `.planning/phases/06-crm-reviews-agent/06-CONTEXT.md` - client completion and review-alert conventions
- `.planning/phases/06-crm-reviews-agent/06-02-SUMMARY.md` - review alert/admin surface patterns

### Existing code Phase 7 must extend
- `src/lib/db/schema/marketing.ts` - marketing content source of truth
- `src/lib/admin/marketing.ts` - marketing read model
- `src/lib/admin/seo.ts` - SEO read model
- `src/app/admin/(protected)/marketing/page.tsx` - marketing admin surface
- `src/app/admin/(protected)/seo/page.tsx` - SEO admin surface
- `src/lib/analytics.ts` - event tracking patterns
- `src/app/layout.tsx` - global metadata and scripts context

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The admin surfaces for SEO and marketing already exist and can accept richer data without route restructuring.
- Marketing content already has a dedicated table with status, scheduling, and engagement fields.
- The landing page metadata is already populated; Phase 7 should build on that instead of replacing it.

### Gaps Phase 7 must fill
- No `seo_posts` table exists yet.
- No SEO generation or reporting helpers exist yet.
- No Meta/TikTok publish helpers exist yet.
- No cron entrypoints exist yet for SEO or social publishing.
- No admin summaries for keywords, report cadence, or social queue health exist yet.

### Integration Points
- SEO content should connect to booking completions and weekly keyword scheduling.
- Marketing posts should move from draft to scheduled to published through server-side jobs.
- Admin should remain the system of record for generated content and publish readiness.

</code_context>

<deferred>
## Deferred Ideas

- Full social comment engagement automation
- Competitor benchmarking dashboards beyond the initial keyword report
- Auto-generated per-species landing pages
- TikTok ad campaign management beyond the first publishing/pixel integration

</deferred>

---

*Phase: 07-seo-marketing-agents*
*Context gathered: 2026-04-15*
