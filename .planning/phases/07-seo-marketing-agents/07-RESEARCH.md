# Phase 7 Research: SEO and Marketing Agents

**Completed:** 2026-04-15
**Status:** Research complete, ready for planning

## What Was Researched

### SEO content pipeline
- The admin SEO page already exists and reads from completed bookings, so Phase 7 can extend it with generated blog content and keyword reports.
- The repo does not yet have a `seo_posts` table, so this phase will need a dedicated content store for generated blog posts and fishing reports.
- The existing landing SEO metadata is already strong, so the phase is about automation and reporting rather than replacing the public metadata strategy.

### Marketing publishing pipeline
- The admin marketing page already renders draft and scheduled posts from `marketing_posts`.
- The existing `marketing_posts` table is enough to hold the content calendar and publishing state for the first pass.
- Phase 7 can extend this with Meta and TikTok publishing helpers rather than inventing a second social-content model.

### Integrations
- Meta Graph API and TikTok Business API are the key external publishing surfaces for this phase.
- The repo already tracks Meta/TikTok pixels and social links, so the phase can stay aligned with the existing public/marketing stack.
- Scheduled publishing belongs in a cron-friendly server workflow, not in the browser or admin UI.

### Admin visibility
- SEO and marketing admin pages already exist as launch-ready shells.
- Phase 7 should make them read from real generated content and show status, drafts, and reports without changing the route tree.

## Validation Architecture

1. Generate SEO content and marketing posts server-side.
2. Persist content and publish state in Neon.
3. Push approved social posts to Meta and TikTok.
4. Surface the generated content and performance reports in admin.

## Research Outcome

Phase 7 can build on the existing admin shells and `marketing_posts` table. The missing pieces are a `seo_posts` table, SEO generation and reporting helpers, and Meta/TikTok publishing helpers that can be scheduled from the server.

