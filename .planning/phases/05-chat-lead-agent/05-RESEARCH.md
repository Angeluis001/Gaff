# Phase 5 Research: Chat and Lead Agent

**Completed:** 2026-04-15
**Status:** Research complete, ready for planning

## What Was Researched

### Botpress web chat lifecycle
- The existing landing page bridge already loads Botpress through `NEXT_PUBLIC_BOTPRESS_BOT_ID` and `NEXT_PUBLIC_BOTPRESS_CLIENT_ID`.
- Current Botpress webchat guidance uses an explicit init/open lifecycle rather than a passive script embed.
- The repo already dispatches a custom `gaff:open-chat` event from the FAQ CTA, so the browser-side contract is already in place.
- Phase 5 should align the bridge with the current Botpress lifecycle and keep the widget mount asynchronous.

### OpenClaw WhatsApp gateway
- OpenClaw is an external control plane for WhatsApp, not a public landing-page dependency.
- The gateway can receive authenticated hooks and route them into a local skills/agent layer.
- The repo already reserves `OPENCLAW_URL` in `.env.example`, so the deployment boundary is already anticipated.
- Phase 5 should treat OpenClaw as an inbound channel and keep the Next.js app responsible for normalization and persistence.

### Lead and activity models
- The database already has a lead model with source, status, classification, preferred date, preferred boat category, and metadata fields.
- The lead timeline table already exists, so follow-up actions can be recorded without adding a new audit structure.
- This means Phase 5 can focus on orchestration and channel ingress rather than schema invention.

### Shared FAQ knowledge base
- The FAQ section already exists on the landing page and is the natural source for chat answers.
- The correct contract is a single canonical FAQ payload that both Botpress and OpenClaw can consume.
- That keeps public copy, bot answers, and chat escalation behavior aligned.

### Lead classification and follow-up
- Phase 5 should classify leads server-side after capture, not in the browser.
- Hot/warm/cold classification belongs in the Lead Agent so follow-up timing can be centralized.
- Lead activities should capture the follow-up history so the admin dashboard can explain why a lead is being contacted.

### Admin visibility
- The admin surface already exists, so hot-lead alerts can land there without creating a separate internal console.
- Phase 5 should make hot-lead visibility explicit in admin rather than relying on hidden automation.

## Validation Architecture

1. Capture chat or WhatsApp input.
2. Normalize it into the lead model.
3. Persist the lead and activity timeline.
4. Classify the lead server-side.
5. Queue the follow-up sequence.
6. Surface hot-lead warnings in admin.

## Research Outcome

Phase 5 can be implemented directly on top of the current codebase without changing the product model. The main work is to align the Botpress bridge, add an authenticated OpenClaw ingress path, and introduce a server-side Lead Agent workflow that uses the existing leads and activities tables.

