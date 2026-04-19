export type OpenClawWebhookPayload = {
  conversationId?: string
  messageId?: string
  from?: string
  phone?: string
  name?: string
  text?: string
  body?: string
  caption?: string
  timestamp?: string | number
  metadata?: Record<string, unknown>
  lead?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    whatsappNumber?: string
    preferredDate?: string
    preferredBoatCategory?: string
    groupSize?: number
    notes?: string
    source?: string
    metadata?: Record<string, unknown>
  }
}

export type OpenClawNormalizationResult = {
  source: "whatsapp"
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  whatsappNumber: string | null
  notes: string | null
  preferredDate: Date | null
  preferredBoatCategory: string | null
  groupSize: number | null
  message: string
  metadata: Record<string, unknown>
  conversationId: string | null
  messageId: string | null
  inboundAt: Date
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseInboundDate(value: string | number | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getOpenClawWebhookSecret() {
  return (
    process.env.OPENCLAW_WEBHOOK_SECRET?.trim() ||
    process.env.OPENCLAW_WEBHOOK_TOKEN?.trim() ||
    process.env.OPENCLAW_TOKEN?.trim() ||
    ""
  )
}

export function verifyOpenClawRequest(request: Request) {
  const expectedSecret = getOpenClawWebhookSecret()

  if (!expectedSecret) {
    return process.env.NODE_ENV !== "production"
  }

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  const headerToken = request.headers.get("x-openclaw-token")?.trim()

  return bearerToken === expectedSecret || headerToken === expectedSecret
}

export function normalizeOpenClawPayload(
  payload: OpenClawWebhookPayload
): OpenClawNormalizationResult {
  const lead = payload.lead ?? {}
  const sourceName = normalizeText(lead.source) || "whatsapp"
  const name = normalizeText(lead.firstName || payload.name || payload.from) || "WhatsApp Lead"
  const [firstName = "WhatsApp", ...restNameParts] = name.split(/\s+/)
  const lastName = normalizeText(lead.lastName || restNameParts.join(" "))
  const email = normalizeText(lead.email) || null
  const phone = normalizeText(lead.phone || payload.phone || payload.from) || null
  const whatsappNumber = normalizeText(lead.whatsappNumber || payload.phone || payload.from) || phone
  const message = normalizeText(payload.text || payload.body || payload.caption)
  const notes = normalizeText(lead.notes || message) || null
  const preferredDate = parseInboundDate(lead.preferredDate)
  const preferredBoatCategory = normalizeText(lead.preferredBoatCategory) || null
  const groupSize = Number.isFinite(lead.groupSize) ? Number(lead.groupSize) : null

  return {
    source: "whatsapp",
    firstName,
    lastName: lastName || null,
    email,
    phone,
    whatsappNumber,
    notes,
    preferredDate,
    preferredBoatCategory,
    groupSize,
    message,
    metadata: {
      ...payload.metadata,
      lead: lead.metadata ?? {},
      sourceName,
    },
    conversationId: normalizeText(payload.conversationId) || null,
    messageId: normalizeText(payload.messageId) || null,
    inboundAt: parseInboundDate(payload.timestamp) ?? new Date(),
  }
}

