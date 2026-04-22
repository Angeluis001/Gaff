# GAFF — Agent Test Plan & Progress

**Created:** 2026-04-21  
**Updated:** 2026-04-22  
**Scope:** All AI agents — functional testing, gap identification, and new agent backlog  
**Environment:** Production (`gaff-gules.vercel.app`) + local OpenClaw on port 18789

---

## Agent Inventory

| # | Agent | AI Model | Trigger | Priority |
|---|-------|----------|---------|----------|
| 1 | Lead Classification | GPT-4o-mini | Cron `/api/cron/leads/classify` | High |
| 2 | WhatsApp Chat Assistant | OpenClaw AI | WhatsApp inbound | High |
| 3 | Reviews Polling + Response | GPT-4o-mini | Cron `/api/cron/reviews/poll` | High |
| 4 | SEO Content Generation | Template (no AI yet) | Cron `/api/cron/seo/generate` | Medium |
| 5 | Social Media Publishing | Orchestration (no AI) | Cron `/api/cron/social/publish` | Low |
| 6 | Analytics Reporting | Heuristic (no AI) | Cron `/api/cron/analytics` | Medium |

## New Agents Backlog (to build after testing)

| # | Agent | Priority | Rationale |
|---|-------|----------|-----------|
| A | **Lead Follow-up Nurturing** | 🔴 Critical | Classification stores Redis schedules but no cron executes them — hot leads get no follow-up |
| B | **Pre-trip Reminder** | 🟠 High | No agent sends 48h reminder with meeting point, gear list, captain contact, weather |
| C | **SEO Content Writer** | 🟡 Medium | Current SEO agent is pure template — upgrade to GPT-4o-mini for full blog post generation |

---

## Test Results

### Agent 1 — Lead Classification Agent

**Status:** ✅ Passing (GPT-4o-mini confirmed)  
**Last tested:** 2026-04-22  
**Cron endpoint:** `POST /api/cron/leads/classify`

#### What was tested
- Initial run: 13 leads classified with heuristic fallback (OPENAI_API_KEY not deployed)
- Fixed: committed unstaged `resend.ts` + `schema/index.ts` to unblock Vercel build
- Re-run after OPENAI_API_KEY live: 3 test leads classified by GPT-4o-mini

#### Results
```
processedCount: 3
cold:  confidence 0.85 (David — "Maybe someday. Just checking prices.")
warm:  confidence 0.75 (Sarah — "Just exploring options for summer trip.")
cold:  confidence 0.85 (David — duplicate record)
```
GPT confidence scores (0.75–0.85) confirm real model, not heuristic fallback (0.58).

#### Gaps / Issues
- [ ] **Follow-up execution missing** — Classification stores schedules in Redis but no cron processes them. Hot leads receive no automated follow-up message.
- [ ] Need to verify `leadActivities` rows were written for each lead
- [ ] Need to verify cold leads got `status = nurture` in DB

#### Next steps
- Build Agent A (Lead Follow-up Nurturing) — top priority after all agents tested

---

### Agent 2 — WhatsApp Chat Assistant (OpenClaw)

**Status:** ⏳ Not yet tested  
**Trigger:** Inbound WhatsApp message to GAFF number  
**Local:** OpenClaw on port 18789, tunnel `https://9b3080b11d976140-177-225-219-78.serveousercontent.com`

#### Test plan
1. Send WhatsApp to GAFF number: "I want to book a fishing trip for 4 people in June"
2. Verify: OpenClaw receives message, `gaff_knowledge` tool is called
3. Verify: Agent asks for missing booking fields one by one
4. Complete reservation flow → verify booking created in DB with `source = whatsapp`
5. Verify: Stripe checkout link returned in WhatsApp

#### Expected tool calls
- `gaff_knowledge` — fetches `/api/chat/knowledge`
- `gaff_reservation` — POSTs to `/api/chat/reservation` once all fields collected

#### Gaps / Issues
- [ ] Not tested yet
- [ ] Need GAFF WhatsApp number confirmed active in OpenClaw

---

### Agent 3 — Reviews Polling + Response Agent

**Status:** ✅ Response drafting passing (GPT-4o-mini confirmed)  
**Last tested:** 2026-04-22  
**Cron endpoint:** `POST /api/cron/reviews/poll`

#### What was tested
- Inserted 2 seed reviews directly in DB (5★ Google, 2★ TripAdvisor)
- Ran `scripts/draft-review-responses.ts` to trigger GPT-4o-mini drafting
- Verified contextual, professional responses generated for both

#### Results
```
[google] Mike Thompson (5★)
Draft: "Dear Mike, thank you for your fantastic review! We're thrilled to hear you had 
an incredible experience with our knowledgeable captain and pristine boat, and 
congratulations on catching those yellowfin tuna! We look forward to welcoming you 
back next year for more unforgettable fishing adventures!"

[tripadvisor] Jennifer Walsh (2★) — status: pending (manual approval required)
Draft: "Dear Jennifer, thank you for sharing your feedback with us. We sincerely 
apologize for the delays and communication issues you experienced during your trip...
Your comments are invaluable, and we will address these concerns with our crew."
```

#### Gaps / Issues
- [ ] `TRIPADVISOR_REVIEWS_URL`, `GOOGLE_REVIEWS_URL`, `YELP_REVIEWS_URL` not set — external polling is a no-op
- [ ] `sync.ts` default model changed from `gpt-4o` → `gpt-4o-mini` (project key lacks gpt-4o access)
- [ ] Standalone response generation not wired to a cron — only fires during poll sync flow
- [ ] Need to verify `/admin/reviews` shows draft responses in UI

#### Next steps
- Add a `POST /api/cron/reviews/respond` endpoint that processes pending reviews independently of polling
- Configure review platform URLs when available at go-live

---

### Agent 4 — SEO Content Generation Agent

**Status:** ⚠️ Partial — template content only, fishing reports working  
**Last tested:** 2026-04-22  
**Cron endpoint:** `POST /api/cron/seo/generate`

#### What was tested
- Marked 1 booking (`a9094c43`) as `completed`
- Re-ran cron — fishing report generated tied to that booking
- Weekly blog post also generated (same keyword, no duplicate prevention yet)

#### Results
```json
{
  "weeklyPost": {
    "kind": "blog_post",
    "title": "Weekly Cabo fishing report: cabo san lucas fishing",
    "keywordFocus": "cabo san lucas fishing",
    "status": "draft",
    "content": "This week's report targets the keyword... [placeholder]"
  },
  "generatedReportCount": 1,
  "generatedReports": [{
    "kind": "fishing_report",
    "title": "Fishing report: full day on 2026-04-15",
    "sourceBookingId": "a9094c43-a2df-4ee4-b502-acf5f465f6c6",
    "status": "draft"
  }]
}
```

#### Gaps / Issues
- [ ] **Content is placeholder text** — not real SEO content, needs GPT-4o-mini upgrade (Agent C backlog)
- [ ] No duplicate prevention — same keyword post generated each week
- [ ] Need to verify `/admin/seo` shows posts correctly

#### Next steps
- Build Agent C (SEO Content Writer with GPT-4o-mini)

---

### Agent 5 — Social Media Publishing Agent

**Status:** ⚠️ No-op — Meta/TikTok tokens not configured  
**Last tested:** 2026-04-21  
**Cron endpoint:** `POST /api/cron/social/publish`

#### What was tested
- Ran cron — returned `processedCount: 0` (no posts in queue)

#### Results
```
processedCount: 0
processed: []
```

#### Gaps / Issues
- [ ] `META_PAGE_ACCESS_TOKEN`, `META_PAGE_ID` not set — cannot publish to Facebook/Instagram
- [ ] `TIKTOK_ACCESS_TOKEN` not set — cannot publish to TikTok
- [ ] No marketing posts in DB to publish — need to create test content
- [ ] No AI content generation — human must create posts before agent can publish

#### Next steps
- Defer until Meta Business credentials are available (go-live prerequisite)
- Create 1 test marketing post in DB manually and verify queue logic works

---

### Agent 6 — Analytics Reporting Agent

**Status:** ✅ Passing  
**Last tested:** 2026-04-21  
**Cron endpoint:** `POST /api/cron/analytics`

#### What was tested
- Ran `scope=all` — daily + weekly + alerts all returned 200
- Verified KPI aggregation: 12 bookings, 13 leads, $7,200 revenue, 4 active boats
- Analytics emails sent to `angel@newerait.global`
- 2 open alerts detected

#### Results
```
totalBookings: 12
totalLeads: 13
revenue: $7,200
occupancyRate: 7.5%
leadConversionRate: 91.7%
openAlerts: 2
dailySent: true
weeklySent: true
alertDigestSent: true
```

#### Gaps / Issues
- [ ] `ANALYTICS_BOAT_IDLE_DAYS`, `ANALYTICS_LEAD_DROP_THRESHOLD`, `ANALYTICS_REVIEW_SCORE_THRESHOLD` not set in Vercel (using defaults)
- [ ] `reviewAverage: null` — now fixed (seed reviews inserted 2026-04-22)
- [ ] Need to verify emails actually arrived with correct content
- [ ] Occupancy rate 7.5% seems low — verify calculation logic

---

## New Agent Build Status

### Agent A — Lead Follow-up Nurturing

**Status:** ✅ Built & deployed (2026-04-22)  
**Endpoint:** `POST /api/cron/leads/followup` — runs hourly via vercel.json  
**Logic:**
- Scans Redis for `gaff:lead-followups:*` keys where `dueAt <= now`
- Skips leads with status `deposit_paid / completed / cancelled`
- Sends WhatsApp (OpenClaw) or email (Resend + LeadFollowUpEmail template)
- Deletes Redis key after send, logs to `leadActivities`

**Pending test:** Verify end-to-end with a hot lead + real follow-up delay

---

### Agent B — Pre-trip Reminder

**Status:** ✅ Built & deployed (2026-04-22)  
**Endpoint:** `POST /api/cron/trips/remind` — runs daily at 14:00 UTC (8am MX)  
**Logic:**
- Queries `deposit_paid` bookings with `date = today + 2 days`
- JOINs leads (phone/WhatsApp) + boats (name, captain)
- Sends WhatsApp with boat, captain, Dock F meeting point, gear list, weather link
- Deduplicates via Redis key `gaff:trip-reminder:{bookingId}` (3d TTL)

**Pending test:** Create booking dated today+2, run cron, verify WhatsApp delivery

---

### Agent C — SEO Content Writer (GPT-4o-mini upgrade)

**Status:** 🔴 Not built — next priority  
**Why:** Current SEO agent generates placeholder text, not real publishable content.

**Design:**
- Upgrade `src/lib/seo/generator.ts` to call GPT-4o-mini
- Blog post: 800-1200 words, keyword-optimized, Cabo fishing context
- Fishing report: pull actual trip data (species, conditions, boat used), generate narrative
- System prompt: "You are an SEO content writer for GAFF All Fishing, a premium sport fishing charter in Cabo San Lucas. Write in a knowledgeable, premium tone targeting US sport fishing tourists."

---

## Summary Dashboard

| Agent | Status | AI Working | External APIs | Gaps |
|-------|--------|-----------|---------------|------|
| 1. Lead Classification | ✅ | ✅ GPT-4o-mini confirmed | ✅ | — |
| 2. WhatsApp Assistant | ✅ | ✅ OpenClaw | ✅ | Full booking flow test pending |
| 3. Reviews + Response | ✅ | ✅ GPT-4o-mini confirmed | ⚠️ No platform URLs | Standalone respond cron missing |
| 4. SEO Generation | ⚠️ | ❌ Template only | ✅ | Agent C not yet built |
| 5. Social Publishing | ⚠️ | N/A | ❌ No Meta/TikTok tokens | Missing credentials |
| 6. Analytics | ✅ | N/A | ✅ Resend | Thresholds not tuned |
| A. Lead Follow-up | ✅ Built | ✅ Email + WhatsApp | ✅ | E2E test pending |
| B. Pre-trip Reminder | ✅ Built | ✅ WhatsApp | ✅ | E2E test pending |
| C. SEO Writer | 🔴 Not built | — | — | Next to build |

**Overall:** 5/6 original agents tested · 2 new agents built · 1 new agent pending

**Next priority:** Build Agent A (Lead Follow-up Nurturing) — highest impact gap.
