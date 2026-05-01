import { db } from "@/lib/db"
import { clients } from "@/lib/db/schema"
import { redis } from "@/lib/redis"
import { eq } from "drizzle-orm"

type CampaignType = "anniversary" | "seasonal" | "reengagement"

export type ClientCampaignSchedule = {
  clientId: string
  type: CampaignType
  dueAt: string
  key: string
  payload: Record<string, unknown>
}

function scheduleDate(daysFromNow: number) {
  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + daysFromNow)
  return dueAt
}

async function persistCampaign(schedule: ClientCampaignSchedule) {
  if (redis) {
    await redis.set(schedule.key, JSON.stringify(schedule.payload))
  }
}

const CRM_MODEL = "gpt-4o-mini"

const CAMPAIGN_PROMPTS: Record<"anniversary" | "seasonal" | "reengagement", string> = {
  anniversary: `You write retention emails for GAFF All Fishing Los Cabos — a premium sport fishing charter in Cabo San Lucas, México.

EMAIL SEQUENCE FRAMEWORK:
- One Email, One Job: this email's single purpose is to celebrate the client's trip anniversary and invite them to rebook
- Structure: Hook (specific memory of their trip) → Value (what's running now / new season opportunity) → CTA (direct booking link)
- Subject line: personalized with species caught or trip date ("One year ago, you caught your first marlin off Cabo")
- Body: 150-200 words max, mobile-first
- Sign-off: "See you on the water, The GAFF Team"

CLIENT CONTEXT will be provided in the user message as JSON.
Return JSON: { "subject": "...", "body": "..." }`,

  seasonal: `You write seasonal promotion emails for GAFF All Fishing Los Cabos — a premium sport fishing charter in Cabo San Lucas, México.

EMAIL SEQUENCE FRAMEWORK:
- One Email, One Job: alert the client that their preferred species season is approaching and secure a booking
- Structure: Hook (season urgency — "marlin peak is 6 weeks away") → Value (match their species preference to current season) → CTA (booking link with urgency)
- Subject line: species + season specificity ("Blue marlin peak opens in 6 weeks — your window is now")
- Body: 120-160 words. Lead with the season data, not the sales pitch.
- Sign-off: "Book before the peak fills, The GAFF Team"

GAFF fishing seasons: Marlin Jun-Nov (peak Oct), Tuna May-Dec (peak Aug-Sep), Dorado Jun-Oct, Wahoo Jul-Nov.
CLIENT CONTEXT will be provided in the user message as JSON.
Return JSON: { "subject": "...", "body": "..." }`,

  reengagement: `You write re-engagement emails for GAFF All Fishing Los Cabos — a premium sport fishing charter in Cabo San Lucas, México.

CHURN PREVENTION FRAMEWORK:
- One Email, One Job: re-activate a client who hasn't booked in 6+ months
- Dynamic offer by situation: if client has 1 trip → "first-time returnee" angle; if 2+ trips → "loyal angler" angle
- Structure: Hook (acknowledge the gap warmly, not accusatorially) → Value (what they're missing — peak season, new boat) → CTA (early-bird offer or date hold)
- Subject line: personalized, scarcity-driven ("We saved you a spot for marlin season — want it?")
- Body: 150-180 words. Tone: warm friend, not sales email.
- Sign-off: "Hope to see you back on the water, The GAFF Team"

CLIENT CONTEXT will be provided in the user message as JSON.
Return JSON: { "subject": "...", "body": "..." }`,
}

const FALLBACK_EMAILS: Record<"anniversary" | "seasonal" | "reengagement", { subject: string; body: string }> = {
  anniversary: {
    subject: "One year since your GAFF fishing adventure — time for another?",
    body: "It's been a year since your charter with us in Cabo San Lucas. We hope the memory of that trip is still fresh.\n\nCabo fishing is in peak form right now — marlin, tuna, and dorado are all running. If you've been thinking about coming back, this is a great window to lock in your dates before the season fills.\n\nReply to this email or visit gaffallfishingloscabos.com/booking to check availability.\n\nSee you on the water,\nThe GAFF Team",
  },
  seasonal: {
    subject: "Your fishing season window is open — here's what's running",
    body: "The species you love are running in Cabo right now.\n\nOur fleet has openings this season and we wanted to give past clients first look before peak availability fills. October is our strongest month for marlin — if that's on your list, now is the time.\n\nVisit gaffallfishingloscabos.com/booking to check dates.\n\nBook before the peak fills,\nThe GAFF Team",
  },
  reengagement: {
    subject: "We saved you a spot — want to come back to Cabo?",
    body: "It's been a while since we've seen you on the water in Cabo.\n\nA lot has happened since your last trip — new tackle, updated fleet, and the marlin are running strong. We'd love to have you back.\n\nIf timing or budget was the reason, we have early-booking rates available for returning anglers. Reply here and I'll send you the details.\n\nHope to see you back on the water,\nThe GAFF Team",
  },
}

async function generateCampaignEmail(
  type: "anniversary" | "seasonal" | "reengagement",
  clientContext: {
    name: string
    email: string
    totalTrips: number
    preferredSpecies: string[]
    lastTripDate: string | null
  }
): Promise<{ subject: string; body: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return FALLBACK_EMAILS[type]
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CRM_MODEL,
        temperature: 0.6,
        response_format: { type: "json_object" },
        messages: [
          { role: "user", content: CAMPAIGN_PROMPTS[type] },
          { role: "user", content: JSON.stringify(clientContext) },
        ],
      }),
    })
    if (!res.ok) return FALLBACK_EMAILS[type]
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string | null } }> }
    const raw = data.choices?.[0]?.message?.content?.trim()
    if (!raw) return FALLBACK_EMAILS[type]
    const parsed = JSON.parse(raw) as Partial<{ subject: string; body: string }>
    if (typeof parsed.subject === "string" && typeof parsed.body === "string") {
      return { subject: parsed.subject, body: parsed.body }
    }
    return FALLBACK_EMAILS[type]
  } catch {
    return FALLBACK_EMAILS[type]
  }
}

export async function scheduleClientLifecycleCampaigns(clientId: string) {
  const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1)

  if (!client) {
    throw new Error("Client not found.")
  }

  const clientContext = {
    name: `${client.firstName} ${client.lastName ?? ""}`.trim(),
    email: client.email,
    totalTrips: client.totalTrips ?? 0,
    preferredSpecies: client.preferredSpecies ?? [],
    lastTripDate: client.lastTripDate ? client.lastTripDate.toISOString() : null,
  }

  const [anniversaryEmail, seasonalEmail, reengagementEmail] = await Promise.all([
    generateCampaignEmail("anniversary", clientContext),
    generateCampaignEmail("seasonal", clientContext),
    generateCampaignEmail("reengagement", clientContext),
  ])

  const schedules: ClientCampaignSchedule[] = [
    {
      clientId: client.id,
      type: "anniversary",
      dueAt: scheduleDate(365).toISOString(),
      key: `gaff:client-campaign:${client.id}:anniversary`,
      payload: {
        clientId: client.id,
        type: "anniversary",
        name: clientContext.name,
        email: clientContext.email,
        emailSubject: anniversaryEmail.subject,
        emailBody: anniversaryEmail.body,
      },
    },
    {
      clientId: client.id,
      type: "seasonal",
      dueAt: scheduleDate(90).toISOString(),
      key: `gaff:client-campaign:${client.id}:seasonal`,
      payload: {
        clientId: client.id,
        type: "seasonal",
        name: clientContext.name,
        email: clientContext.email,
        emailSubject: seasonalEmail.subject,
        emailBody: seasonalEmail.body,
      },
    },
    {
      clientId: client.id,
      type: "reengagement",
      dueAt: scheduleDate(180).toISOString(),
      key: `gaff:client-campaign:${client.id}:reengagement`,
      payload: {
        clientId: client.id,
        type: "reengagement",
        name: clientContext.name,
        email: clientContext.email,
        emailSubject: reengagementEmail.subject,
        emailBody: reengagementEmail.body,
      },
    },
  ]

  await Promise.all(schedules.map((schedule) => persistCampaign(schedule)))

  return schedules
}
