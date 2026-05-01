---
phase: 10
slug: openclaw-whatsapp-agents
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-01
---

# Phase 10 — Validation Strategy

> Per-phase validation contract. This is a verification-only phase — all features are pre-implemented. Validation is manual E2E + DB state checks (no formal test framework in project).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — project has no jest/vitest/pytest config |
| **Config file** | none |
| **Quick run command** | `npm run type-check && npm run lint` |
| **Full suite command** | `npm run type-check && npm run lint` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run type-check`
- **After every plan wave:** Run `npm run type-check && npm run lint`
- **Before `/gsd-verify-work`:** Type-check + lint green + manual E2E scenarios passed
- **Max feedback latency:** 10 seconds (static checks); E2E requires live WhatsApp

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 10-01-01 | 01 | 1 | F1-F5 migrations | T-10-07 | `whatsapp_sessions` table exists in Neon | script | `npx tsx scripts/verify-migrations-10.ts` | ⬜ pending |
| 10-01-02 | 01 | 1 | env vars | — | ADMIN_WHATSAPP_NUMBER + GOOGLE_REVIEW_URL set | human-action | Set in Vercel dashboard | ⬜ pending |
| 10-02-01 | 02 | 2 | F3 cold nurturing | — | `lead_followup_steps` has stepIndex 3,4 for cold leads | script | `npx tsx scripts/verify-cold-steps.ts` | ⬜ pending |
| 10-02-02 | 02 | 2 | F2 review cron | — | review_request_sent_at populated after cron trigger | script+curl | `curl .../cron/trips/review-request` | ⬜ pending |
| 10-02-03 | 02 | 2 | F4 upsell | — | stepIndex=99 exists after deposit | script | `npx tsx scripts/verify-upsell-step.ts` | ⬜ pending |
| 10-03-01 | 03 | 3 | F1 security | T-10-07, T-10-08, T-10-09 | 401 on no secret; admin number from env; user role isolation | automated curl | `curl -X POST .../openclaw` (no secret → 401) | ⬜ pending |
| 10-03-02 | 03 | 3 | F1+F5 E2E | — | Agent replies to availability query; escalation fires | human-verify | Send WhatsApp messages per test script | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed — all verification is via seed scripts (already exist in `scripts/`) and manual WhatsApp interaction.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Agent replies to "do you have availability on May 10?" | F1 conversational agent | Requires live WhatsApp number and OpenClaw running | Send from real WhatsApp; verify reply within 30s references real boat availability |
| Agent escalates on "I need to cancel" | F5 human escalation | Requires admin phone and live OpenClaw | Send from WhatsApp; verify ADMIN_WHATSAPP_NUMBER receives alert with client name and reason |
| Review request WhatsApp arrives after trip | F2 review cron | Requires live WhatsApp delivery | Seed completed booking, trigger cron, verify WhatsApp arrives at lead phone |

---

## Validation Sign-Off

- [x] All tasks have automated verify OR are explicitly human-action/human-verify
- [x] Sampling continuity: static checks after every wave; E2E at wave 3
- [x] Wave 0: no MISSING file references — scripts/ directory already has seed scripts pattern
- [x] No watch-mode flags used
- [x] Feedback latency: type-check < 10s; E2E latency explicitly documented as manual
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
