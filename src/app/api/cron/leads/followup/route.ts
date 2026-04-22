import { eq, inArray } from "drizzle-orm"
import { NextResponse } from "next/server"
import { createElement } from "react"

import { db } from "@/lib/db"
import { leads, leadActivities } from "@/lib/db/schema"
import { redis } from "@/lib/redis"
import { sendTransactionalEmail } from "@/lib/resend"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { LeadFollowUpEmail } from "@/emails/LeadFollowUpEmail"

type FollowUpRecord = {
  leadId: string
  classification: string
  channel: "email" | "whatsapp"
  subject: string
  message: string
  scheduledAt: string
  dueAt: string
  delayMinutes: number
}

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

  if (!redis) {
    return NextResponse.json({ received: true, processedCount: 0, skippedCount: 0, processed: [], reason: "redis_not_configured" })
  }

  const now = new Date()
  const pattern = "gaff:lead-followups:*"
  const keys = await redis.keys(pattern)

  if (keys.length === 0) {
    return NextResponse.json({ received: true, processedCount: 0, skippedCount: 0, processed: [] })
  }

  // Fetch all records and filter for due ones
  const rawValues = await Promise.all(keys.map((k) => redis!.get(k)))
  const due: Array<{ key: string; record: FollowUpRecord }> = []

  for (let i = 0; i < keys.length; i++) {
    const raw = rawValues[i]
    if (!raw) continue
    const record = (typeof raw === "string" ? JSON.parse(raw) : raw) as FollowUpRecord
    if (new Date(record.dueAt) <= now) {
      due.push({ key: keys[i], record })
    }
  }

  if (due.length === 0) {
    return NextResponse.json({ received: true, processedCount: 0, skippedCount: keys.length, processed: [] })
  }

  // Fetch lead records for all due items (deduplicated)
  const leadIds = [...new Set(due.map((d) => d.record.leadId))]
  const leadRows = await db
    .select({ id: leads.id, firstName: leads.firstName, email: leads.email, phone: leads.phone, whatsappNumber: leads.whatsappNumber, status: leads.status })
    .from(leads)
    .where(inArray(leads.id, leadIds))

  const leadMap = new Map(leadRows.map((l) => [l.id, l]))

  const processed: Array<{ leadId: string; channel: string; status: string }> = []

  for (const { key, record } of due) {
    const lead = leadMap.get(record.leadId)

    // Skip if lead converted, cancelled, or not found
    if (!lead || CONVERTED_STATUSES.includes(lead.status ?? "")) {
      await redis.del(key)
      processed.push({ leadId: record.leadId, channel: record.channel, status: "skipped_converted" })
      continue
    }

    try {
      if (record.channel === "whatsapp") {
        const to = lead.whatsappNumber ?? lead.phone
        if (to) {
          await sendWhatsAppMessage(to, record.message)
        }
      } else {
        if (lead.email) {
          await sendTransactionalEmail({
            to: lead.email,
            subject: record.subject,
            react: createElement(LeadFollowUpEmail, { firstName: lead.firstName, message: record.message }),
          })
        }
      }

      await db.insert(leadActivities).values({
        leadId: record.leadId,
        type: "message_sent",
        description: `Sent ${record.channel} follow-up (${record.classification}): ${record.subject}`,
        agentId: "followup-agent",
      })

      await redis.del(key)
      processed.push({ leadId: record.leadId, channel: record.channel, status: "sent" })
    } catch (err) {
      processed.push({ leadId: record.leadId, channel: record.channel, status: "error" })
      console.error(`[followup] failed key=${key}`, err)
    }
  }

  return NextResponse.json({
    received: true,
    processedCount: processed.filter((p) => p.status === "sent").length,
    skippedCount: keys.length - due.length,
    processed,
  })
}
