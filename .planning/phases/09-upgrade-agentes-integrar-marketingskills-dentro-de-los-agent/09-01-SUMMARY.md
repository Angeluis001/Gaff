---
phase: 09-upgrade-agentes-integrar-marketingskills-dentro-de-los-agent
plan: "01"
subsystem: agents
tags: [marketing, lead-agent, follow-up, submodule, buyer-psychology, email-sequence]
dependency_graph:
  requires: []
  provides:
    - .agents/skills/marketingskills (git submodule — 40 skills library)
    - .agents/product-marketing-context.md (canonical GAFF positioning)
    - lead-agent.ts enriched system prompt with buyer psychology
    - follow-up.ts Hook-Value-CTA messages for all 3 lead tiers
  affects:
    - src/lib/agents/lead-agent.ts
    - src/lib/chat/follow-up.ts
tech_stack:
  added: []
  patterns:
    - Buyer psychology signals in LLM system prompts (goal-gradient, scarcity, loss aversion, group commitment)
    - Hook-Value-CTA email sequence framework applied to static follow-up messages
    - product-marketing-context.md as canonical positioning file for all agent prompts
key_files:
  created:
    - .agents/product-marketing-context.md
    - .agents/skills/marketingskills/ (git submodule)
  modified:
    - .gitmodules
    - src/lib/agents/lead-agent.ts
    - src/lib/chat/follow-up.ts
decisions:
  - marketingskills installed as git submodule (not clone) to allow upstream updates
  - Skill content distilled manually into TypeScript string literals — submodule is reference only, never loaded at runtime
  - Placeholder tokens {{firstName}}, {{seasonNote}}, {{monthsUntilPeak}} in follow-up messages deferred to Phase 10 interpolation
metrics:
  duration: ~30 minutes
  completed: "2026-04-30T04:15:55Z"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 4
---

# Phase 9 Plan 01: marketingskills Integration — Lead Agent + Follow-up Sequence Summary

**One-liner:** Installed marketingskills git submodule, created GAFF product-marketing-context.md, and enriched Lead Agent classification with buyer psychology signals (goal-gradient/scarcity/loss aversion) plus rewrote all 7 FOLLOW_UP_SEQUENCE messages using Hook-Value-CTA structure with urgency, social proof, and scarcity copy.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Install marketingskills submodule + create product-marketing-context.md | `6cf31af` | Done |
| 2 | Enrich Lead Agent system prompt with buyer psychology frameworks | `c795d6c` | Done |
| 3 | Rewrite FOLLOW_UP_SEQUENCE with Hook-Value-CTA email framework | `bb01078` | Done |

## What Was Built

### Task 1 — marketingskills Submodule + product-marketing-context.md

- `.gitmodules` updated with submodule entry pointing to `https://github.com/coreyhaines31/marketingskills`
- `.agents/skills/marketingskills/` cloned (40 skills: email-sequence, marketing-psychology, copywriting, programmatic-seo, ai-seo, social-content, churn-prevention, customer-research, competitor-profiling, analytics-tracking, and 30+ more)
- `.agents/product-marketing-context.md` created with 7 GAFF-specific sections:
  - Product Overview (charter premium, Cabo San Lucas marina, 4 vessels)
  - Target Audience (US tourists 35-55, $1k-5k budget, books 3-8 weeks ahead)
  - Problems & Pain Points (trust uncertainty, season uncertainty, choice paralysis, booking friction)
  - Competitive Landscape (Pisces Sport Fishing, Picante Fleet, travel agencies)
  - Brand Voice (confident/expert/warm, never cheap/pushy/generic)
  - Proof Points (4.8★ TripAdvisor 500+ reviews, IGFA-certified captains, GrayFishTag)
  - Conversion Triggers (scarcity, social proof, loss aversion, goal-gradient, reciprocity)

### Task 2 — Lead Agent System Prompt Enrichment

`src/lib/agents/lead-agent.ts` `classifyLeadWithOpenAI()` system message expanded from 1 line to ~30 lines:

- **CLASSIFICATION TIERS**: hot (2+ urgency signals), warm (moderate urgency), cold (exploratory/far-future)
- **BUYER PSYCHOLOGY SIGNALS**: goal-gradient (≤7 days = hot bias), Oct-Nov marlin scarcity bias, group commitment (≥6 = +1 hot signal), loss aversion framing in nextAction, social proof trigger, luxury anchor
- **JOBS TO BE DONE**: adventure story, family bonding, bachelor/bachelorette, corporate reward — high-value persona auto-upgrades warm-to-hot
- model, response_format, temperature, and JSON structure of the API call unchanged

### Task 3 — FOLLOW_UP_SEQUENCE Rewrite

All 7 messages in `src/lib/chat/follow-up.ts` rewritten using Hook-Value-CTA framework:

**Hot tier (2 steps):**
- Email (60 min): Subject "Your Cabo marlin window is closing — let's lock it in" — loss aversion hook, 4.8★ social proof, 24-hour hold CTA
- WhatsApp (4h): Personalized urgency + direct booking link

**Warm tier (2 steps):**
- Email (24h): Subject "Still planning your Cabo trip? Here's what to know" — value via IGFA captains + season matching, low-friction CTA
- WhatsApp (72h): No-commitment comparison offer, 2-minute qualifier

**Cold tier (5 steps):**
- Email (48h): Species/season education hook — "booking wrong season" mistake prevention
- Email (7d): Marlin peak window intel + peak-books-out-early scarcity
- WhatsApp (14d): Weekly Cabo fishing update with seasonal intel
- WhatsApp (21d): Year-round species calendar + 4.8★ guarantee
- Email (30d): "Last open dates" — 48-hour no-deposit hold offer

Structure, types, delayMinutes, channel values, step count (hot:2/warm:2/cold:5), and `scheduleLeadFollowUps()` function body unchanged.

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `npm run type-check` | Pass (exit 0) |
| Lint | `npm run lint` | Pass (exit 0) |
| Submodule skills count | `ls .agents/skills/marketingskills/skills/ | wc -l` | 40 (≥10 required) |
| BUYER PSYCHOLOGY SIGNALS | `grep -c "BUYER PSYCHOLOGY SIGNALS" src/lib/agents/lead-agent.ts` | 1 |
| goal-gradient | `grep -c "goal-gradient" src/lib/agents/lead-agent.ts` | 1 |
| Urgency copy (hot) | `grep -c "closing|fills|hold" src/lib/chat/follow-up.ts` | 3 |
| Target Audience | `grep "Target Audience" .agents/product-marketing-context.md` | 1 |
| .gitmodules submodule | `cat .gitmodules` | marketingskills entry present |

## Deviations from Plan

### Pre-existing Work Detected

**Task 1 already committed before this agent ran:** Commit `6cf31af` (`feat(09-01): install marketingskills submodule and create product-marketing-context.md`) was present at HEAD-2 when this agent initialized. The commit meets all Task 1 acceptance criteria exactly. No rework needed — Task 1 was verified and counted as complete.

**Task 2 implemented but not committed:** `src/lib/agents/lead-agent.ts` contained the enriched system prompt (matching the plan spec exactly) as an unstaged modification. This agent staged and committed it as `c795d6c`.

Both deviations are consistent with a prior agent session that completed partial work. No plan-level changes were needed.

### Auto-fixed Issues

None — plan executed cleanly.

## Known Stubs

- `{{firstName}}` in WhatsApp messages — placeholder for recipient name interpolation
- `{{seasonNote}}` in warm email — placeholder for dynamic season intelligence
- `{{monthsUntilPeak}}` in cold week-7 email — placeholder for calculated marlin peak proximity

These tokens are stored verbatim in the `leadFollowupSteps` DB table. They are not eval'd at runtime (safe per T-09-03 in threat model). Variable interpolation is deferred to Phase 10.

## Threat Flags

No new security-relevant surface introduced. All changes are compile-time TypeScript string literals — no new network endpoints, auth paths, or file access patterns added. Supply chain threat (T-09-01) mitigated: submodule is reference-only, never loaded at runtime via `fs.readFileSync` or similar.

## Self-Check: PASSED

- `.agents/product-marketing-context.md` — FOUND
- `.agents/skills/marketingskills/` — FOUND (40 skills)
- `src/lib/agents/lead-agent.ts` — FOUND with BUYER PSYCHOLOGY SIGNALS
- `src/lib/chat/follow-up.ts` — FOUND with Hook-Value-CTA messages
- Commit `6cf31af` — FOUND (Task 1)
- Commit `c795d6c` — FOUND (Task 2)
- Commit `bb01078` — FOUND (Task 3)
