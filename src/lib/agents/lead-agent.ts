import type { LeadClassification } from "@/lib/chat/lead-types"

export type LeadClassificationInput = {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  whatsappNumber: string | null
  source: string
  status: string | null
  preferredDate: Date | string | null
  preferredBoatCategory: string | null
  groupSize: number | null
  notes: string | null
  metadata: unknown
  createdAt: Date | string | null
}

export type LeadAgentResult = {
  classification: LeadClassification
  confidence: number
  reason: string
  nextAction: string
  model: string
  source: "openai" | "heuristic"
}

const OPENAI_LEAD_MODEL = process.env.OPENAI_LEAD_MODEL?.trim() || "gpt-4o-mini"

function toDateValue(value: Date | string | null | undefined) {
  if (!value) {
    return null
  }

  return value instanceof Date ? value : new Date(value)
}

function getLeadLeadTimeDays(lead: LeadClassificationInput) {
  const preferredDate = toDateValue(lead.preferredDate)
  const createdAt = toDateValue(lead.createdAt)

  if (!preferredDate || !createdAt) {
    return null
  }

  const difference = preferredDate.getTime() - createdAt.getTime()

  return Math.round(difference / (1000 * 60 * 60 * 24))
}

function heuristicClassifyLead(lead: LeadClassificationInput): LeadAgentResult {
  const leadTimeDays = getLeadLeadTimeDays(lead)
  const contactSignals = [lead.email, lead.phone, lead.whatsappNumber].filter(Boolean).length
  const groupSize = Number(lead.groupSize ?? 0)
  const notes = `${lead.notes ?? ""}`.toLowerCase()
  const boatInterest = `${lead.preferredBoatCategory ?? ""}`.toLowerCase()

  let score = 0

  if (leadTimeDays !== null && leadTimeDays <= 14) {
    score += 3
  } else if (leadTimeDays !== null && leadTimeDays <= 45) {
    score += 1
  }

  if (contactSignals >= 2) {
    score += 2
  } else if (contactSignals === 1) {
    score += 1
  }

  if (groupSize >= 6) {
    score += 2
  } else if (groupSize >= 4) {
    score += 1
  }

  if (notes.includes("book") || notes.includes("today") || notes.includes("ready")) {
    score += 2
  }

  if (boatInterest.includes("luxury") || boatInterest.includes("large")) {
    score += 1
  }

  if (score >= 6) {
    return {
      classification: "hot",
      confidence: 0.84,
      reason: "The lead shows strong booking intent, near-term timing, or strong contact signals.",
      nextAction: "Schedule the hot sequence and prioritise direct outreach within the hour.",
      model: "heuristic",
      source: "heuristic",
    }
  }

  if (score >= 3) {
    return {
      classification: "warm",
      confidence: 0.68,
      reason: "The lead is qualified but not yet urgent enough for the hot path.",
      nextAction: "Nurture with the warm sequence and check back after one day.",
      model: "heuristic",
      source: "heuristic",
    }
  }

  return {
    classification: "cold",
    confidence: 0.58,
    reason: "The lead lacks enough urgency or detail to be treated as hot right now.",
    nextAction: "Use the cold sequence and re-engage on a longer cadence.",
    model: "heuristic",
    source: "heuristic",
  }
}

function buildLeadSummary(lead: LeadClassificationInput) {
  const leadTimeDays = getLeadLeadTimeDays(lead)
  const preferredDate = toDateValue(lead.preferredDate)?.toISOString() ?? "unknown"

  return {
    name: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
    source: lead.source,
    status: lead.status ?? "new",
    email: lead.email,
    phone: lead.phone,
    whatsappNumber: lead.whatsappNumber,
    preferredDate,
    preferredBoatCategory: lead.preferredBoatCategory,
    groupSize: lead.groupSize,
    leadTimeDays,
    notes: lead.notes,
    metadata: lead.metadata ?? {},
  }
}

async function classifyLeadWithOpenAI(lead: LeadClassificationInput): Promise<LeadAgentResult | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_LEAD_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Classify leads for GAFF All Fishing Los Cabos — a premium sport fishing charter in Cabo San Lucas, México targeting US tourists.

CLASSIFICATION TIERS:
- hot: booking intent is clear AND at least 2 urgency signals are present (preferred date ≤14 days, marlin peak Oct-Nov, group_size ≥6, luxury/large boat requested, notes include "book"/"ready"/"today"/"deposit")
- warm: genuine interest with moderate urgency (date 15-45 days out, 1-2 contact signals, group 3-5, no strong intent words)
- cold: exploratory, far-future date, single weak signal, or no date provided

BUYER PSYCHOLOGY SIGNALS — apply these when evaluating:
- goal-gradient: the closer the preferred date, the lower the hot threshold (≤7 days = hot bias regardless of other signals)
- Scarcity: Oct-Nov marlin peak season → any lead with those months biased toward hot even at 30 days
- Group commitment: group_size ≥6 = family or corporate event = higher sunk cost = higher conversion intent → +1 hot signal
- Loss aversion framing: if classifying hot, nextAction MUST include urgency language ("limited October dates", "marlin peak window", "only X spots")
- Social proof trigger: notes mentioning "TripAdvisor", "recommended", "friend said" → warm-to-hot upgrade signal
- Luxury anchor: luxury or large boat requested = higher value lead = lower hot threshold

JOBS TO BE DONE (customer research context):
- US tourists "hire" a Cabo fishing charter for: adventure story to tell, family bonding, bachelor/bachelorette experience, corporate reward
- High-value personas: bachelor trips (group ≥6, notes "bachelor/bachelorette"), family reunions (group ≥6, mixed ages), corporate (notes "team/company/work")
- These personas = automatic warm-to-hot upgrade even with far dates

Return valid JSON: { "classification": "hot"|"warm"|"cold", "confidence": 0.0-1.0, "reason": "1 concise sentence", "nextAction": "1 actionable instruction for the sales team" }`,
        },
        {
          role: "user",
          content: JSON.stringify(buildLeadSummary(lead)),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI lead classification failed with status ${response.status}.`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>
  }

  const rawContent = payload.choices?.[0]?.message?.content?.trim()

  if (!rawContent) {
    return null
  }

  const parsed = JSON.parse(rawContent) as Partial<LeadAgentResult>
  const classification =
    parsed.classification === "hot" ||
    parsed.classification === "warm" ||
    parsed.classification === "cold"
      ? parsed.classification
      : null

  if (!classification) {
    return null
  }

  return {
    classification,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
    reason:
      typeof parsed.reason === "string" && parsed.reason.trim()
        ? parsed.reason.trim()
        : "OpenAI lead classification returned a structured result.",
    nextAction:
      typeof parsed.nextAction === "string" && parsed.nextAction.trim()
        ? parsed.nextAction.trim()
        : "Schedule the appropriate follow-up sequence.",
    model: OPENAI_LEAD_MODEL,
    source: "openai",
  }
}

export async function classifyLead(lead: LeadClassificationInput): Promise<LeadAgentResult> {
  try {
    const aiResult = await classifyLeadWithOpenAI(lead)

    if (aiResult) {
      return aiResult
    }
  } catch {
    // Fall back to the deterministic heuristic when OpenAI is unavailable.
  }

  return heuristicClassifyLead(lead)
}

export function buildLeadClassificationNote(result: LeadAgentResult) {
  return `Lead classified as ${result.classification} via ${result.source} (${result.model}).`
}
