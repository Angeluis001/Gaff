# Phase 5: Chat and Lead Agent - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 connects GAFF's public conversation layer to the lead pipeline. It owns the visitor chat experience on the landing page, the WhatsApp ingress path through OpenClaw, and the server-side Lead Agent workflow that classifies and sequences every captured lead.

This phase does not replace the existing landing page or admin dashboard. It extends both by introducing a shared FAQ knowledge source, authenticated inbound chat handling, and timed follow-up orchestration that later CRM and analytics phases can reuse.

</domain>

<decisions>
## Implementation Decisions

### Chat surfaces
- **D-01:** Keep Botpress as the public web chat experience and treat it as the primary conversational UI for landing-page visitors.
- **D-02:** Keep OpenClaw as the WhatsApp channel and treat it as an external gateway/control plane rather than a public app feature.
- **D-03:** Use one canonical FAQ payload that both channels consume so the public copy and bot answers stay in sync.

### Lead pipeline
- **D-04:** Persist every chat or WhatsApp capture into the existing `leads` table with source, contact info, status, and metadata.
- **D-05:** Record all follow-up and state changes in `lead_activities` so the admin dashboard can explain what happened to a lead.
- **D-06:** Run lead classification server-side with GPT-4o-mini and keep the browser out of the decision path.
- **D-07:** Use timed follow-up sequences for hot/warm/cold leads so the system can automate the next contact without manual intervention.

### Admin visibility
- **D-08:** Surface hot-lead warnings in the existing admin dashboard instead of introducing a separate operations console.
- **D-09:** Make the lead pipeline observable through timeline entries and status updates before later CRM work adds deeper lifecycle automation.

### Claude's Discretion
- Exact message copy for chat prompts, follow-up emails, and WhatsApp nudges
- Whether FAQ content is stored as a JSON file, typed module, or a small server helper, as long as it is canonical
- Whether OpenClaw hooks are handled by a single route or a small ingress module plus route wrapper, as long as auth and normalization stay server-side

</decisions>

<specifics>
## Specific Ideas

- `src/components/BotpressWidgetBridge.tsx` already mounts the widget and listens for `gaff:open-chat`.
- `src/components/landing/FAQSection.tsx` already dispatches `gaff:open-chat` from the CTA.
- `src/lib/db/schema/leads.ts` already has `classification`, `preferredDate`, `preferredBoatCategory`, `metadata`, and conversion fields.
- `src/lib/db/schema/activities.ts` already gives the lead timeline model needed for follow-up history.
- `src/lib/admin/agents.ts` already exposes agent statuses, so Phase 5 can extend the agent panel later without changing the overall admin structure.
- `.env.example` already reserves `OPENCLAW_URL` and Botpress env vars, so the phase can stay consistent with the existing configuration model.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap
- `.planning/PROJECT.md` - product constraints, channel strategy, and platform choices
- `.planning/REQUIREMENTS.md` - CHAT-01 through CHAT-04 and LEAD-01 through LEAD-06
- `.planning/ROADMAP.md` - Phase 5 goal, dependency on Phase 4, and success criteria
- `.planning/STATE.md` - current milestone position and execution readiness

### Prior phase outputs Phase 5 must honor
- `.planning/phases/04-admin-dashboard/04-CONTEXT.md` - protected admin shell and navigation contracts
- `.planning/phases/04-admin-dashboard/04-03-SUMMARY.md` - admin surfaces that Phase 5 will extend with alerts and lead visibility

### Existing code Phase 5 must extend
- `src/app/layout.tsx` - global widget bridge mount
- `src/components/BotpressWidgetBridge.tsx` - current Botpress loader and custom open-chat contract
- `src/components/landing/FAQSection.tsx` - FAQ CTA that triggers chat
- `src/lib/db/schema/leads.ts` - lead source of truth
- `src/lib/db/schema/activities.ts` - lead timeline source of truth
- `src/lib/admin/agents.ts` - admin-facing agent status surface
- `.env.example` - Botpress, OpenClaw, and OpenAI configuration placeholders

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The public landing already has the chat launcher contract, so Phase 5 can preserve the current visitor experience while swapping in richer behavior behind it.
- The existing lead schema is already expressive enough for source tracking, classification, and follow-up metadata.
- The admin dashboard exists, so Phase 5 can reuse it for lead alerts instead of creating a parallel internal UI.

### Gaps Phase 5 must fill
- No canonical FAQ payload exists yet for Botpress and OpenClaw to share.
- No authenticated OpenClaw ingress route exists yet.
- No server-side lead normalization or classification workflow exists yet.
- No explicit hot-lead alert surface exists in the admin UI yet.

### Integration Points
- Botpress should remain the web-facing conversation layer.
- OpenClaw should remain the WhatsApp-facing conversation layer.
- Neon should remain the persistence layer for leads and lead activities.
- The Lead Agent should be the single place where classification and next-step timing are decided.

</code_context>

<deferred>
## Deferred Ideas

- Full WhatsApp Business API migration
- Direct Instagram DM capture and reply routing
- Rich conversation analytics and transcript search
- Full CRM lifecycle automation, which belongs to Phase 6
- Review management and SEO content generation, which belong to Phases 6 and 7

</deferred>

---

*Phase: 05-chat-lead-agent*
*Context gathered: 2026-04-15*
