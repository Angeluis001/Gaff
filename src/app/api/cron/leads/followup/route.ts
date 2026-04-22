import { and, eq, inArray, isNull, lte } from "drizzle-orm"
import { NextResponse } from "next/server"
import { createElement } from "react"

import { db } from "@/lib/db"
import { leads, leadActivities, leadFollowupSteps } from "@/lib/db/schema"
import { sendTransactionalEmail } from "@/lib/resend"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { LeadFollowUpEmail } from "@/emails/LeadFollowUpEmail"

const CONVERTED_STATUSES = ["deposit_paid", "completed", "cancelled"]

function isAuthorizedCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) return process.env.NODE_ENV !== "production"
  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  const headerToken = request.headers.get("x-cron-secret")?.trim()
  return bearerToken === cronSecret || headerToken === cronSecret
}

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const now = new Date()

  // Fetch all pending steps that are due
  const dueSteps = await db
    .select()
    .from(leadFollowupSteps)
    .where(and(isNull(leadFollowupSteps.sentAt), lte(leadFollowupSteps.dueAt, now)))

  if (dueSteps.length === 0) {
    return NextResponse.json({ received: true, processedCount: 0, skippedCount: 0, processed: [] })
  }

  // Fetch leads for all due steps
  const leadIds = [...new Set(dueSteps.map((s) => s.leadId))]
  const leadRows = await db
    .select({ id: leads.id, firstName: leads.firstName, email: leads.email, phone: leads.phone, whatsappNumber: leads.whatsappNumber, status: leads.status })
    .from(leads)
    .where(inArray(leads.id, leadIds))

  const leadMap = new Map(leadRows.map((l) => [l.id, l]))
  const processed: Array<{ leadId: string; stepId: string; channel: string; status: string }> = []

  for (const step of dueSteps) {
    const lead = leadMap.get(step.leadId)

    // Skip if lead converted, cancelled, or not found
    if (!lead || CONVERTED_STATUSES.includes(lead.status ?? "")) {
      await db.update(leadFollowupSteps).set({ sentAt: now }).where(eq(leadFollowupSteps.id, step.id))
      processed.push({ leadId: step.leadId, stepId: step.id, channel: step.channel, status: "skipped_converted" })
      continue
    }

    try {
      if (step.channel === "whatsapp") {
        const to = lead.whatsappNumber ?? lead.phone
        if (to) await sendWhatsAppMessage(to, step.message)
      } else {
        if (lead.email) {
          await sendTransactionalEmail({
            to: lead.email,
            subject: step.subject,
            react: createElement(LeadFollowUpEmail, { firstName: lead.firstName, message: step.message }),
          })
        }
      }

      await db.update(leadFollowupSteps).set({ sentAt: now }).where(eq(leadFollowupSteps.id, step.id))

      await db.insert(leadActivities).values({
        leadId: step.leadId,
        type: "message_sent",
        description: `Sent ${step.channel} follow-up (${step.classification}): ${step.subject}`,
        agentId: "followup-agent",
      })

      processed.push({ leadId: step.leadId, stepId: step.id, channel: step.channel, status: "sent" })
    } catch (err) {
      processed.push({ leadId: step.leadId, stepId: step.id, channel: step.channel, status: "error" })
      console.error(`[followup] failed stepId=${step.id}`, err)
    }
  }

  return NextResponse.json({
    received: true,
    processedCount: processed.filter((p) => p.status === "sent").length,
    skippedCount: processed.filter((p) => p.status === "skipped_converted").length,
    processed,
  })
}
