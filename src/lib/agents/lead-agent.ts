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
          content:
            "Classify GAFF fishing charter leads as hot, warm, or cold. Return valid JSON with classification, confidence, reason, and nextAction.",
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
