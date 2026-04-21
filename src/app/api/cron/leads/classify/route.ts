import { isNull } from "drizzle-orm"
import { NextResponse } from "next/server"

import { classifyAndScheduleLead } from "@/lib/chat/inbound"
import { db } from "@/lib/db"
import { leads } from "@/lib/db/schema"

function isAuthorizedCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production"
  }

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  const headerToken = request.headers.get("x-cron-secret")?.trim()

  return bearerToken === cronSecret || headerToken === cronSecret
}

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const pendingLeads = await db
      .select()
      .from(leads)
      .where(isNull(leads.classification))
      .limit(25)

    const processed = []

    for (const lead of pendingLeads) {
      const classification = await classifyAndScheduleLead(lead)

      processed.push({
        leadId: lead.id,
        classification: classification.classification,
        confidence: classification.confidence,
      })
    }

    return NextResponse.json({
      received: true,
      processedCount: processed.length,
      processed,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to classify queued leads."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return POST(request)
}

