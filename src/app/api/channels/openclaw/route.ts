import { NextResponse } from "next/server"

import { ingestInboundLead, normalizeInboundLeadFromOpenClaw } from "@/lib/chat/inbound"
import {
  normalizeOpenClawPayload,
  verifyOpenClawRequest,
  type OpenClawWebhookPayload,
} from "@/lib/chat/openclaw"

export async function POST(request: Request) {
  if (!verifyOpenClawRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const payload = (await request.json()) as OpenClawWebhookPayload
    const normalized = normalizeInboundLeadFromOpenClaw(normalizeOpenClawPayload(payload))

    const result = await ingestInboundLead(normalized)

    return NextResponse.json({
      received: true,
      leadId: result.lead.id,
      isNewLead: result.isNewLead,
      activityId: result.activityId,
      source: normalized.source,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process OpenClaw payload."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 })
}
