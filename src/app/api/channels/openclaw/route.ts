import { NextResponse } from "next/server"

import { runChatAgent } from "@/lib/agents/chat-agent"
import { db } from "@/lib/db"
import { leadActivities } from "@/lib/db/schema"
import { ingestInboundLead, normalizeInboundLeadFromOpenClaw } from "@/lib/chat/inbound"
import {
  normalizeOpenClawPayload,
  verifyOpenClawRequest,
  type OpenClawWebhookPayload,
} from "@/lib/chat/openclaw"
import { appendMessage, getOrCreateSession, updateSessionStatus } from "@/lib/chat/conversation"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

export async function POST(request: Request) {
  if (!verifyOpenClawRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const payload = (await request.json()) as OpenClawWebhookPayload
    const normalized = normalizeInboundLeadFromOpenClaw(normalizeOpenClawPayload(payload))

    const result = await ingestInboundLead(normalized)
    const { lead } = result

    const whatsappNumber = lead.whatsappNumber ?? lead.phone ?? normalized.whatsappNumber
    const userMessage = normalized.message?.trim()

    let replied = false

    // Run conversational agent if we have a message and a WhatsApp number to reply to
    if (userMessage && whatsappNumber && process.env.OPENCLAW_URL) {
      const session = await getOrCreateSession(whatsappNumber, lead.id)

      // Don't reply to escalated sessions — human is handling it
      if (session.status !== "escalated") {
        await appendMessage(session.id, {
          role: "user",
          content: userMessage,
          timestamp: new Date().toISOString(),
        })

        try {
          const agentResult = await runChatAgent({
            sessionId: session.id,
            messages: session.messages ?? [],
            userMessage,
            lead: {
              firstName: lead.firstName,
              lastName: lead.lastName,
              whatsappNumber,
            },
          })

          if (agentResult.reply) {
            await sendWhatsAppMessage(whatsappNumber, agentResult.reply)

            await appendMessage(session.id, {
              role: "assistant",
              content: agentResult.reply,
              timestamp: new Date().toISOString(),
            })

            replied = true
          }

          // Handle escalation
          if (agentResult.escalated) {
            await updateSessionStatus(session.id, "escalated", agentResult.escalationReason)

            const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER
            if (adminNumber && process.env.OPENCLAW_URL) {
              const alertMsg =
                `🚨 *WhatsApp escalation — GAFF*\n\n` +
                `Customer: ${lead.firstName} ${lead.lastName ?? ""}\n` +
                `Number: ${whatsappNumber}\n` +
                `Reason: ${agentResult.escalationReason ?? "Not specified"}\n` +
                `Last message: "${userMessage.slice(0, 100)}"`
              await sendWhatsAppMessage(adminNumber, alertMsg).catch((err) =>
                console.error("[openclaw] Admin escalation alert failed:", err)
              )
            }

            await db.insert(leadActivities).values({
              leadId: lead.id,
              type: "note",
              description: `Conversation escalated to human. Reason: ${agentResult.escalationReason ?? "unspecified"}`,
              metadata: { sessionId: session.id, channel: "whatsapp" },
              agentId: "chat-agent",
            })
          }
        } catch (agentError) {
          console.error("[openclaw] Chat agent error:", agentError)
          // Agent errors are non-fatal — lead is already ingested
        }
      }
    }

    return NextResponse.json({
      received: true,
      leadId: lead.id,
      isNewLead: result.isNewLead,
      activityId: result.activityId,
      source: normalized.source,
      replied,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process OpenClaw payload."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 })
}
