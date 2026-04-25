import { eq, or } from "drizzle-orm"

import { classifyLead, type LeadClassificationInput } from "@/lib/agents/lead-agent"
import { db } from "@/lib/db"
import { leadActivities, leads } from "@/lib/db/schema"

import { scheduleLeadFollowUps } from "./follow-up"
import type { OpenClawNormalizationResult } from "./openclaw"

export type InboundLeadInput = {
  source: typeof leads.$inferSelect["source"]
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  whatsappNumber: string | null
  notes: string | null
  preferredDate: Date | null
  preferredBoatCategory: typeof leads.$inferSelect["preferredBoatCategory"]
  groupSize: number | null
  metadata: Record<string, unknown>
  message: string
  conversationId: string | null
  messageId: string | null
  inboundAt: Date
}

export type InboundLeadResult = {
  lead: typeof leads.$inferSelect
  isNewLead: boolean
  activityId: number
}

function mergeMetadata(existing: unknown, incoming: Record<string, unknown>) {
  if (existing && typeof existing === "object" && !Array.isArray(existing)) {
    return {
      ...(existing as Record<string, unknown>),
      ...incoming,
    }
  }

  return incoming
}

function normalizePreferredBoatCategory(value: string | null) {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()

  return ["standard", "midsize", "large", "luxury"].includes(normalized)
    ? (normalized as typeof leads.$inferSelect["preferredBoatCategory"])
    : null
}

export function normalizeInboundLeadFromOpenClaw(
  payload: OpenClawNormalizationResult
): InboundLeadInput {
  return {
    source: payload.source,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    whatsappNumber: payload.whatsappNumber,
    notes: payload.notes,
    preferredDate: payload.preferredDate,
    preferredBoatCategory: normalizePreferredBoatCategory(payload.preferredBoatCategory),
    groupSize: payload.groupSize,
    metadata: payload.metadata,
    message: payload.message,
    conversationId: payload.conversationId,
    messageId: payload.messageId,
    inboundAt: payload.inboundAt,
  }
}

async function findMatchingLead(input: InboundLeadInput) {
  const conditions = []

  if (input.email) {
    conditions.push(eq(leads.email, input.email))
  }

  if (input.phone) {
    conditions.push(eq(leads.phone, input.phone))
  }

  if (input.whatsappNumber) {
    conditions.push(eq(leads.whatsappNumber, input.whatsappNumber))
  }

  if (conditions.length === 0) {
    return null
  }

  const [lead] = await db
    .select()
    .from(leads)
    .where(conditions.length === 1 ? conditions[0] : or(...conditions))
    .limit(1)

  return lead ?? null
}

export async function ingestInboundLead(input: InboundLeadInput): Promise<InboundLeadResult> {
  const existingLead = await findMatchingLead(input)

  const payload = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    whatsappNumber: input.whatsappNumber,
    source: input.source,
    status: existingLead?.status ?? "new",
    preferredDate: input.preferredDate ?? existingLead?.preferredDate ?? null,
    preferredBoatCategory:
      input.preferredBoatCategory ?? existingLead?.preferredBoatCategory ?? null,
    groupSize: input.groupSize ?? existingLead?.groupSize ?? null,
    notes: input.notes ?? existingLead?.notes ?? null,
    metadata: mergeMetadata(existingLead?.metadata, {
      ...input.metadata,
      message: input.message,
      conversationId: input.conversationId,
      messageId: input.messageId,
      inboundAt: input.inboundAt.toISOString(),
      channel: input.source,
    }),
    updatedAt: new Date(),
  } satisfies typeof leads.$inferInsert

  const lead = existingLead
    ? (
        await db
          .update(leads)
          .set(payload)
          .where(eq(leads.id, existingLead.id))
          .returning()
      )[0]
    : (
        await db
          .insert(leads)
          .values(payload)
          .returning()
      )[0]

  const msgPreview = input.message
    ? `"${input.message.slice(0, 300)}${input.message.length > 300 ? "…" : ""}"`
    : null

  const activity = (
    await db
      .insert(leadActivities)
      .values({
        leadId: lead.id,
        type: "note",
        description: msgPreview
          ? `📩 Customer (${input.source}): ${msgPreview}`
          : existingLead
            ? `Inbound ${input.source} message received.`
            : `Inbound ${input.source} lead captured.`,
        metadata: {
          source: input.source,
          conversationId: input.conversationId,
          messageId: input.messageId,
          message: input.message,
        },
        agentId: "inbound-chat",
      })
      .returning({ id: leadActivities.id })
  )[0]

  return {
    lead,
    isNewLead: !existingLead,
    activityId: activity.id,
  }
}

export async function classifyAndScheduleLead(lead: LeadClassificationInput) {
  const classification = await classifyLead(lead)
  const leadRecord = await db
    .update(leads)
    .set({
      classification: classification.classification,
      status: (classification.classification === "cold" ? "nurture" : lead.status ?? "new") as
        typeof leads.$inferSelect["status"],
      updatedAt: new Date(),
    })
    .where(eq(leads.id, lead.id))
    .returning()

  await db.insert(leadActivities).values({
    leadId: lead.id,
    type: "status_change",
    description: `Lead classified as ${classification.classification}. ${classification.reason}`,
    metadata: {
      classification: classification.classification,
      confidence: classification.confidence,
      reason: classification.reason,
      nextAction: classification.nextAction,
      model: classification.model,
      source: classification.source,
    },
    agentId: "lead-agent",
  })

  await scheduleLeadFollowUps(leadRecord[0] ?? lead, classification.classification)

  return classification
}
