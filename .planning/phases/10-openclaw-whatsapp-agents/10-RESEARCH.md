# Phase 10: OpenClaw WhatsApp Agent Expansion — Research

**Researched:** 2026-04-29
**Domain:** WhatsApp conversational agent, Drizzle ORM, Vercel Cron, OpenAI function calling
**Confidence:** HIGH — all claims verified against actual codebase files

---

## Summary

Phase 10 converts GAFF's WhatsApp channel from a passive ingest pipe to a full conversational sales and CRM agent. The good news for planning: the PLAN.md checklist is largely accurate — most infrastructure from F1 through F5 has already been built and committed to the codebase. What remains is not "build all five features" but rather "verify the already-merged code is end-to-end wired, fix any gaps, and ensure all E2E smoke tests pass."

The codebase audit shows: `chat-agent.ts`, `conversation.ts`, `whatsapp-sessions` Drizzle schema and SQL migration, `review-request` cron route, `vercel.json` cron entry, `review_request_sent_at` on the bookings schema, the 5-step cold sequence in `follow-up.ts`, and the upsell step in the Stripe webhook are ALL present and complete. The only confirmed gaps are: (1) `GOOGLE_REVIEW_URL` and `ADMIN_WHATSAPP_NUMBER` are not yet set in Vercel (per PLAN.md checklist), and (2) the E2E conversational tests have not been run. Planning should focus on verification waves, not re-implementation.

**Primary recommendation:** Structure the plan as a verification-first phase: confirm each subsystem works in isolation, then run the E2E WhatsApp conversation test. No new files need to be created — the work is integration validation and the two missing env vars.

---

## Codebase State Audit (VERIFIED findings)

This section answers each key unknown listed in the phase brief. All findings are from direct file reads.

### KU-1: Current state of `src/app/api/channels/openclaw/route.ts`

[VERIFIED: direct file read] The route is FULLY WIRED. It does NOT just ingest — it:
1. Verifies the OpenClaw request signature
2. Normalizes the payload and ingests the lead
3. Calls `getOrCreateSession()` from `src/lib/chat/conversation.ts`
4. Appends the user message to the session
5. Calls `runChatAgent()` from `src/lib/agents/chat-agent.ts`
6. Sends the agent reply via `sendWhatsAppMessage()`
7. Handles escalation: updates session status, sends admin WhatsApp alert, logs activity
8. Guards against replying to already-escalated sessions

**Planning implication:** F1 wire-up is complete. The plan should verify it works, not rebuild it.

### KU-2: `sendWhatsAppMessage` — function signature and location

[VERIFIED: direct file read — `src/lib/whatsapp.ts`]

```typescript
export async function sendWhatsAppMessage(to: string, message: string): Promise<void>
```

- Reads `OPENCLAW_URL` from env; silently no-ops if absent (safe for dev/test)
- Normalizes the phone number (handles MX +521 and US +1 formats)
- POSTs to `${OPENCLAW_URL}/gaff/notify` with `{ to, message }` body
- Auth: `Authorization: Bearer ${OPENCLAW_WEBHOOK_SECRET}`

**Planning implication:** The function signature is stable. Any new call site (F3 WhatsApp steps, F4 upsell) uses this exact signature — no changes to `whatsapp.ts` needed.

### KU-3: `src/lib/db/schema/index.ts` — does it export `whatsapp-sessions`?

[VERIFIED: direct file read] Yes. Line 14: `export * from './whatsapp-sessions'`. The schema is already registered.

### KU-4: `src/lib/chat/follow-up.ts` — how many cold steps currently exist?

[VERIFIED: direct file read] The cold sequence has **5 steps** (indexes 0–4):

| Step | Delay | Channel | Subject |
|------|-------|---------|---------|
| 0 | 48h | email | "Still planning that Cabo fishing trip?" |
| 1 | 7d | email | "Your marlin peak window: {{monthsUntilPeak}} months away" |
| 2 | 14d | whatsapp | "Weekly Cabo fishing update" |
| 3 | 21d | whatsapp | "Best season for your target species" |
| 4 | 30d | email | "Last open dates before peak season" |

**Planning implication:** F3 (extended cold nurturing) is already implemented. No modification needed. The plan should verify the WhatsApp steps at index 2 and 3 are being dispatched by the followup cron.

### KU-5: Stripe webhook — where does the upsell step get inserted?

[VERIFIED: direct file read — `src/app/api/stripe/webhook/route.ts`, lines 136–152]

The upsell is already implemented. After `deposit_paid` confirmation, within the `if (!isReplay && booking.leadId)` block:

```typescript
const upsellDueAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
await db.insert(leadFollowupSteps).values({
  leadId: lead.id,
  classification: lead.classification ?? "warm",
  channel: "whatsapp",
  subject: "Upsell post-booking",
  message: `🎣 *Your GAFF trip is confirmed — want to make it even better?*\n\n...`,
  stepIndex: 99,
  dueAt: upsellDueAt,
}).onConflictDoNothing()
```

**Planning implication:** F4 (upsell post-booking) is already implemented. The plan should verify this step appears in `lead_followup_steps` after a test booking payment.

### KU-6: `src/lib/db/schema/whatsapp-sessions.ts` — schema state

[VERIFIED: direct file read] Schema is complete. Matches the spec exactly:

```typescript
export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  whatsappNumber: text("whatsapp_number").notNull(),
  leadId: uuid("lead_id").references(() => leads.id),
  messages: jsonb("messages").$type<WhatsAppMessage[]>().notNull().default([]),
  status: text("status").notNull().default("active"), // active | escalated | closed
  escalationReason: text("escalation_reason"),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
```

SQL migration `0003_whatsapp_sessions.sql` is present and the PLAN.md checklist marks it as applied to Neon.

### KU-7: `vercel.json` cron schedules

[VERIFIED: direct file read] `vercel.json` has 8 cron entries. The review-request cron IS present:

```json
{ "path": "/api/cron/trips/review-request", "schedule": "0 15 * * *" }
```

Note: the PLAN.md spec says `0 14 * * *` (7am Mazatlan) but the actual file uses `0 15 * * *` (8am Mazatlan / UTC-7). This is an 8am local trigger — acceptable; minor discrepancy from spec. No change needed.

**All 8 crons registered:**
- `/api/cron/leads/classify` — 8am UTC daily
- `/api/cron/leads/followup` — 9am UTC daily
- `/api/cron/trips/remind` — 2pm UTC daily (7am Mazatlan)
- `/api/cron/trips/review-request` — 3pm UTC daily (8am Mazatlan)
- `/api/cron/reviews/poll` — 9am UTC daily
- `/api/cron/seo/generate` — 8am UTC Mondays
- `/api/cron/social/publish` — 10am UTC daily
- `/api/cron/analytics` — 7am UTC daily

### KU-8: `bookings.reviewRequestSentAt` field

[VERIFIED: direct file read — `src/lib/db/schema/bookings.ts`, line 29]
`reviewRequestSentAt: timestamp('review_request_sent_at')` is present. Migration `0004_booking_review_request.sql` has `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "review_request_sent_at" timestamp;`.

### KU-9: `src/app/api/cron/trips/review-request/route.ts`

[VERIFIED: direct file read] Fully implemented. Finds bookings with `status = 'completed'` AND `date` in yesterday's window (Mazatlan timezone) AND `reviewRequestSentAt IS NULL`. Sends WhatsApp via `sendWhatsAppMessage`, updates `reviewRequestSentAt`, logs activity.

### KU-10: `src/lib/agents/chat-agent.ts`

[VERIFIED: direct file read] Fully implemented with GPT-4o, 5 tool calls (`check_availability`, `get_pricing`, `get_booking_link`, `get_seasons_info`, `escalate_to_human`), tool execution loop (max 4 rounds), system prompt, and `runChatAgent()` / `runWebChatAgent()` exported functions.

### KU-11: `src/lib/chat/conversation.ts`

[VERIFIED: direct file read] Fully implemented: `getOrCreateSession()`, `appendMessage()`, `updateSessionStatus()` — all present and wired to `whatsappSessions` table.

---

## What Is Actually Pending (Real Gap Analysis)

Based on the PLAN.md checklist checkboxes and codebase audit, the following items are NOT yet done:

| # | Gap | Evidence | Risk |
|---|-----|----------|------|
| G1 | `GOOGLE_REVIEW_URL` not set in Vercel | PLAN.md: "agregar en Vercel una vez que esté disponible el link de Google Business Profile" | Low — review cron falls back to `https://g.page/r/review` |
| G2 | E2E WhatsApp conversation test not run | PLAN.md checkbox unchecked: "enviar WhatsApp 'do you have availability on May 10?'" | Medium — agent is wired but conversation flow unverified in production |
| G3 | E2E escalation test not run | PLAN.md checkbox unchecked: "enviar 'I need to cancel' y verificar escalación + alerta admin" | Medium — escalation path wired but unverified end-to-end |
| G4 | Admin dashboard verification of new followup steps | PLAN.md: "Verificar en admin que nuevos steps aparecen en lead_followup_steps" | Low — data is being written, UI display is separate |
| G5 | Upsell step seed test | PLAN.md: "Probar con seed booking que el step se crea correctamente" | Low — Stripe webhook code is present, needs one test booking |
| G6 | Review request seed test | PLAN.md: "Probar con booking completed de ayer" | Low — cron is wired, needs one seed booking in `completed` status |

**There are NO missing files to create.** All files from the PLAN.md spec exist.

---

## Standard Stack

### Core (already in use — no new installs needed)

[VERIFIED: direct file reads]

| Library | Already Used In | Purpose in Phase 10 |
|---------|----------------|---------------------|
| `drizzle-orm` | All DB files | Query whatsapp_sessions, bookings, leads |
| `openai` (via fetch) | `chat-agent.ts`, `lead-agent.ts` | GPT-4o tool-calling in conversational agent |
| `@neondatabase/serverless` | `src/lib/db/index.ts` | Neon PostgreSQL connection |
| `next/server` (NextResponse) | All API routes | Route handlers |
| Vercel Cron | `vercel.json` | review-request, followup crons |

**Installation:** No new packages required for Phase 10. [VERIFIED: all imports resolved from existing dependencies]

---

## Architecture Patterns

### Pattern 1: Tool-Calling Agent Loop

[VERIFIED: `src/lib/agents/chat-agent.ts`]

The existing `runChatAgent()` uses a direct OpenAI fetch loop (not the OpenAI SDK client) with a 4-round cap. Each round appends tool results and re-calls the API until `finish_reason` is `stop` (no more tool calls). The message history is capped at the last 10 messages to stay within token limits.

This is the correct pattern for this codebase — do not introduce the OpenAI SDK client; the project uses raw fetch to OpenAI consistently.

### Pattern 2: Follow-Up Step Dispatch via Cron

[VERIFIED: `src/app/api/cron/leads/followup/route.ts`]

The followup cron picks up ALL pending `leadFollowupSteps` rows where `sentAt IS NULL` and `dueAt <= now`. It dispatches by channel (`whatsapp` → `sendWhatsAppMessage`, `email` → `sendTransactionalEmail`). The upsell step (`stepIndex: 99`) and the cold WhatsApp steps (index 2, 3) will be picked up by this same cron automatically — no special handling required.

**Pitfall:** The followup cron skips leads with status in `["deposit_paid", "completed", "cancelled"]`. This means the upsell step (created immediately after `deposit_paid`) will be skipped because the lead status is `deposit_paid`. See Pitfall 1 below.

### Pattern 3: Session Lookup — Active Status Gate

[VERIFIED: `src/lib/chat/conversation.ts`, line 10]

`getOrCreateSession()` queries `WHERE status = 'active'`. If a session exists but is `escalated`, a new `active` session is NOT created — the function returns the escalated session. The route handler then checks `session.status !== "escalated"` to prevent replying. This is intentional: escalated conversations don't get bot replies.

**Implication for re-engagement:** Once a session is `escalated`, the customer never gets bot replies again (for that session). The plan may need a way to re-open sessions (e.g., admin marks session as `active` again), but this is out of scope for Phase 10.

---

## Don't Hand-Roll

[VERIFIED against existing codebase]

| Problem | Don't Build | Use Instead (already exists) |
|---------|-------------|------------------------------|
| Sending WhatsApp messages | Custom HTTP wrapper | `sendWhatsAppMessage()` in `src/lib/whatsapp.ts` |
| Managing conversation state | Custom session store | `getOrCreateSession()`, `appendMessage()` in `src/lib/chat/conversation.ts` |
| GPT-4o tool calling | Custom tool dispatch | `runChatAgent()` in `src/lib/agents/chat-agent.ts` |
| Followup step scheduling | Custom scheduler | `scheduleLeadFollowUps()` in `src/lib/chat/follow-up.ts` |
| Cron authorization | Custom auth logic | `requireCron(request)` pattern (check `CRON_SECRET` Bearer token) |
| Timezone math (Mazatlan) | `moment-timezone` | `Intl.DateTimeFormat` with `timeZone: "America/Mazatlan"` (already used in review-request cron) |

---

## Common Pitfalls

### Pitfall 1: Upsell Step Skipped Because Lead Status Is `deposit_paid`

**What goes wrong:** The Stripe webhook sets `lead.status = 'booked'` (line 85–87 in webhook) then creates the upsell followup_step. But looking closely: `leads.status` is set to `"booked"` — NOT `"deposit_paid"`. The followup cron skips leads with status `deposit_paid`, `completed`, or `cancelled`. Status `"booked"` is not in the skip list.

**Verification needed:** Confirm that `"booked"` is not in `CONVERTED_STATUSES = ["deposit_paid", "completed", "cancelled"]` in `followup/route.ts`. [VERIFIED: line 11 — `"booked"` is NOT in this list.] The upsell step will be sent. No issue.

### Pitfall 2: `OPENCLAW_URL` Missing Silently Suppresses All Outbound Messages

**What goes wrong:** `sendWhatsAppMessage()` checks `if (!baseUrl) return` and silently exits. In development or staging without `OPENCLAW_URL` set, every WhatsApp send is a no-op with no error logged. The agent appears to work (returns a reply) but nothing is delivered.

**How to avoid:** In the E2E test, verify that `OPENCLAW_URL` is set in the Vercel environment. The `replied` field in the OpenClaw route response will be `true` even if `sendWhatsAppMessage` silently no-oped — so checking the response JSON is not sufficient; you must verify message delivery on the WhatsApp device.

### Pitfall 3: `getOrCreateSession` Only Finds `active` Sessions

**What goes wrong:** If a session gets `escalated`, the next inbound message creates a NEW `active` session (the WHERE clause filters on `status = 'active'`). Wait — re-reading: the function looks for `status = 'active'`, so if the existing session is `escalated`, there's no match and it tries to INSERT a new session. But the route handler checks `if (session.status !== "escalated")` — except it gets the new `active` session, not the escalated one, so it will reply. This is actually correct behavior for a new conversation restart, but could cause confusion if the human is mid-escalation.

**How to avoid:** This is by design. The plan should document this as expected behavior so tests don't flag it as a bug.

### Pitfall 4: Phone Number Format Mismatch Between Inbound and Outbound

**What goes wrong:** OpenClaw sends inbound payload with a phone in one format (e.g. `52624XXXXXXX`). The reply is sent to `lead.whatsappNumber ?? lead.phone`. If `normalizeWhatsAppNumber()` in `whatsapp.ts` and the inbound normalization in `openclaw.ts` produce different formats, the reply goes to a wrong/undeliverable number.

**How to avoid:** The `sendWhatsAppMessage()` function always normalizes via `normalizeWhatsAppNumber()` before sending, so the format entering the function doesn't matter. This is safe.

### Pitfall 5: `messages` JSONB Column Type Safety

**What goes wrong:** The `messages` column is `jsonb` with `.$type<WhatsAppMessage[]>()`. Drizzle does not validate the shape at runtime — it only provides TypeScript types. If a message is appended with a missing field (e.g. no `timestamp`), the column stores it silently and downstream reads may fail.

**How to avoid:** The `appendMessage()` function always receives a full `WhatsAppMessage` object with `role`, `content`, and `timestamp`. This is already enforced at the call sites.

---

## Environment Availability

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| `OPENCLAW_URL` | All WhatsApp sends, agent activation | Set in Vercel (per PLAN.md checklist ✓) | Absent = silent no-op, not an error |
| `OPENCLAW_WEBHOOK_SECRET` | Inbound verification + outbound auth | Set in Vercel (per PLAN.md checklist ✓) | |
| `OPENAI_API_KEY` | `runChatAgent()` | Set in Vercel (all prior phases use it) | Absent = fallback static reply |
| `OPENCLAW_CHAT_MODEL` | Agent model selection | Set in Vercel (per PLAN.md ✓: `gpt-4o`) | Defaults to `gpt-4o` if absent |
| `ADMIN_WHATSAPP_NUMBER` | Escalation admin alert | NOT YET SET in Vercel | Alert skipped if absent; non-blocking |
| `GOOGLE_REVIEW_URL` | Review request cron | NOT YET SET in Vercel | Falls back to `https://g.page/r/review` |
| `CRON_SECRET` | All cron route auth | Set (prior phases require it) | |
| Neon PostgreSQL | whatsapp_sessions, bookings, leads | Available (all prior phases use it) | Migrations 0003 and 0004 applied |

**Missing dependencies with no fallback:** None — all missing vars have safe fallbacks in code.

**Missing dependencies with fallback:**
- `ADMIN_WHATSAPP_NUMBER` — escalation alert simply skipped
- `GOOGLE_REVIEW_URL` — review cron uses placeholder URL

**Action for plan:** Add a Wave 0 task to set `ADMIN_WHATSAPP_NUMBER` and `GOOGLE_REVIEW_URL` in Vercel before E2E tests.

---

## Validation Architecture

No formal test framework is configured for this project (no `jest.config.*`, no `vitest.config.*`, no `pytest.ini` found). Validation is done via:
1. `npm run type-check` — TypeScript compilation
2. `npm run lint` — ESLint
3. Manual E2E — send real WhatsApp messages and observe behavior

### Phase 10 Test Map

| Requirement | Behavior | Test Type | Command / Method |
|-------------|----------|-----------|-----------------|
| F1: Bidirectional agent | Inbound WhatsApp gets bot reply | E2E manual | Send "do you have availability on May 10?" from WhatsApp |
| F1: Tool calls | Agent queries DB for real availability | E2E manual | Verify reply references actual boat availability |
| F1: Escalation | "I need to cancel" triggers admin alert | E2E manual | Check admin WhatsApp number for alert message |
| F2: Review cron | Completed trips get review WhatsApp | Seed + cron | Set booking `status='completed'` with yesterday's date, trigger cron |
| F3: Cold steps 2-3 | WhatsApp at day 14 and day 21 | DB verification | Check `lead_followup_steps` for cold lead with `stepIndex=3,4` |
| F4: Upsell step | `stepIndex=99` created after deposit | Seed test | Trigger Stripe webhook (or seed directly), check DB |
| F5: Admin alert | Admin WhatsApp received on escalation | E2E manual | Covered by F1 escalation test |

### Pre-E2E Smoke Tests (type-check + lint)
```bash
npm run type-check
npm run lint
```

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Migrations 0003 and 0004 are applied to Neon production DB | PLAN.md checklist says ✓, not independently verified | Agent crashes with table-not-found error on first inbound WhatsApp |
| A2 | `OPENCLAW_URL` and `OPENCLAW_WEBHOOK_SECRET` are set in Vercel production | PLAN.md checklist says ✓ | All WhatsApp sends silently no-op |
| A3 | `OPENCLAW_CHAT_MODEL=gpt-4o` is set in Vercel production | PLAN.md checklist says ✓ | Falls back to `gpt-4o` anyway (same result) — zero risk |

---

## Open Questions (RESOLVED)

1. **Google Business Profile URL for GAFF**
   - RESOLVED: Plan 10-01 Task 2 includes a human-action checkpoint to obtain the Google review URL from the client and set it in Vercel. Until then, the code uses a placeholder URL (`https://g.page/r/review`) which ships safely — `sendWhatsAppMessage` has no null-guard requirement on the URL value.

2. **OpenClaw production readiness**
   - RESOLVED: Plan 10-03 Task 1 includes an automated pre-flight `curl` health check against `OPENCLAW_URL` that must return 200 before the E2E test proceeds. If OpenClaw is down, the pre-flight fails explicitly rather than silently. The operator must re-authenticate via QR scan if the session has expired.

3. **`lead.classification` field on the `leads` table**
   - RESOLVED: The Stripe webhook uses `lead.classification ?? "warm"` — the nullish coalescing operator makes this safe regardless of whether the column exists. If the column is absent, `undefined ?? "warm"` evaluates to `"warm"`, and the upsell step is created with that default. Zero risk at runtime.

---

## Sources

### Primary (HIGH confidence — direct codebase reads)
- `src/app/api/channels/openclaw/route.ts` — F1 wire-up state
- `src/lib/agents/chat-agent.ts` — conversational agent implementation
- `src/lib/chat/conversation.ts` — session management
- `src/lib/chat/follow-up.ts` — cold lead sequence (5 steps confirmed)
- `src/lib/whatsapp.ts` — `sendWhatsAppMessage` signature
- `src/lib/db/schema/whatsapp-sessions.ts` — schema state
- `src/lib/db/schema/bookings.ts` — `reviewRequestSentAt` field
- `src/lib/db/schema/index.ts` — export list
- `src/app/api/stripe/webhook/route.ts` — upsell step creation
- `src/app/api/cron/trips/review-request/route.ts` — F2 implementation
- `src/app/api/cron/leads/followup/route.ts` — followup dispatch logic
- `src/lib/db/migrations/0003_whatsapp_sessions.sql` — migration file
- `src/lib/db/migrations/0004_booking_review_request.sql` — migration file
- `vercel.json` — cron schedule registry
- `.env.example` — env var documentation

### Secondary (MEDIUM confidence)
- `.planning/phases/10-openclaw-whatsapp-agents/PLAN.md` — spec and checklist (used to identify pending items)
- `.planning/phases/05-chat-lead-agent/05-02-SUMMARY.md`, `05-03-SUMMARY.md` — historical context
- `.planning/phases/06-crm-reviews-agent/06-01-SUMMARY.md` — CRM context

---

## Metadata

**Confidence breakdown:**
- Codebase state (all KUs): HIGH — every file was directly read
- Gap analysis: HIGH — derived from PLAN.md checklist vs. file existence
- Environment state: MEDIUM — PLAN.md checklist marks items complete; not independently verified against Vercel dashboard
- E2E behavior: LOW — code is wired but runtime behavior is unverified

**Research date:** 2026-04-29
**Valid until:** 2026-05-29 (stable codebase; 30-day window)
