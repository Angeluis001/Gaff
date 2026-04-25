import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { runWebChatAgent, type WebChatMessage } from "@/lib/agents/chat-agent"
import { ingestInboundLead } from "@/lib/chat/inbound"
import { db } from "@/lib/db"
import { leadActivities, leads } from "@/lib/db/schema"

async function resolveOrCreateLead(
  leadId: string | null | undefined,
  contact: { name?: string; email?: string } | null | undefined,
  firstMessage: string
): Promise<string | null> {
  if (leadId) {
    const [existing] = await db.select({ id: leads.id }).from(leads).where(eq(leads.id, leadId)).limit(1)
    if (existing) return existing.id
  }

  if (!contact?.name) return null

  const nameParts = contact.name.trim().split(" ")
  const firstName = nameParts[0] ?? "Guest"
  const lastName = nameParts.slice(1).join(" ") || null

  const result = await ingestInboundLead({
    source: "website",
    firstName,
    lastName,
    email: contact.email?.trim() || null,
    phone: null,
    whatsappNumber: null,
    notes: null,
    preferredDate: null,
    preferredBoatCategory: null,
    groupSize: null,
    metadata: { channel: "web_chat" },
    message: firstMessage,
    conversationId: null,
    messageId: null,
    inboundAt: new Date(),
  })

  return result.lead.id
}

async function logActivity(leadId: string, description: string, agentId: string) {
  await db.insert(leadActivities).values({
    leadId,
    type: "note",
    description,
    metadata: { channel: "web_chat" },
    agentId,
  })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      history?: WebChatMessage[]
      message?: string
      leadId?: string
      contact?: { name?: string; email?: string }
    }

    const message = typeof body.message === "string" ? body.message.trim() : ""
    const history = Array.isArray(body.history) ? body.history : []

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 })
    }

    const resolvedLeadId = await resolveOrCreateLead(body.leadId, body.contact, message)

    // Log customer message as activity
    if (resolvedLeadId) {
      const preview = `"${message.slice(0, 300)}${message.length > 300 ? "…" : ""}"`
      await logActivity(resolvedLeadId, `📩 Customer (web chat): ${preview}`, "web-chat")
    }

    const result = await runWebChatAgent(history, message)

    // Log bot reply as activity
    if (resolvedLeadId && result.reply) {
      const preview = `"${result.reply.slice(0, 300)}${result.reply.length > 300 ? "…" : ""}"`
      await logActivity(resolvedLeadId, `🤖 Bot (web chat): ${preview}`, "web-chat")
    }

    return NextResponse.json({
      reply: result.reply,
      handoffUrl: result.handoffUrl ?? null,
      leadId: resolvedLeadId,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Chat error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
