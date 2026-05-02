import { and, eq, gte, lt } from "drizzle-orm"

import { db } from "@/lib/db"
import { boatAvailability, boats } from "@/lib/db/schema"
import type { WhatsAppMessage } from "@/lib/db/schema/whatsapp-sessions"

const CHAT_MODEL = process.env.OPENCLAW_CHAT_MODEL?.trim() || "gpt-4o"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gaffallfishingloscabos.com"

export type ChatAgentInput = {
  sessionId: string
  messages: WhatsAppMessage[]
  userMessage: string
  lead: {
    firstName: string
    lastName: string | null
    whatsappNumber: string | null
  }
}

export type ChatAgentResult = {
  reply: string
  escalated: boolean
  escalationReason?: string
}

// ── Tool implementations ────────────────────────────────────────────────────

async function checkAvailability(dateStr: string, boatCategory?: string) {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return { error: "Invalid date. Use YYYY-MM-DD format." }

  const dayStart = new Date(`${dateStr}T00:00:00.000Z`)
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`)

  const allBoats = await db
    .select()
    .from(boats)
    .where(eq(boats.isActive, true))

  const bookedRows = await db
    .select({ boatId: boatAvailability.boatId })
    .from(boatAvailability)
    .where(
      and(
        eq(boatAvailability.isAvailable, false),
        gte(boatAvailability.date, dayStart),
        lt(boatAvailability.date, dayEnd)
      )
    )

  const bookedIds = new Set(bookedRows.map((r) => r.boatId))
  const available = allBoats.filter((b) => {
    if (bookedIds.has(b.id)) return false
    if (boatCategory && b.category !== boatCategory) return false
    return true
  })

  return {
    date: dateStr,
    available: available.length > 0,
    boats: available.map((b) => ({
      id: b.id,
      name: b.name,
      category: b.category,
      capacity: `Up to ${b.capacity} guests`,
      priceHalfDay: b.priceHalfDay ? `$${b.priceHalfDay}` : null,
      priceFullDay: b.priceFullDay ? `$${b.priceFullDay}` : null,
    })),
  }
}

function getPricing(boatCategory?: string) {
  const pricing = [
    { category: "standard", name: "Standard 26ft", capacity: 4, halfDay: 550, fullDay: 850 },
    { category: "midsize", name: "Midsize 31ft", capacity: 6, halfDay: 850, fullDay: 1250 },
    { category: "large", name: "Large 38ft", capacity: 8, halfDay: 1250, fullDay: 1800 },
    { category: "luxury", name: "Luxury 45ft", capacity: 10, halfDay: 1550, fullDay: 1950 },
  ]
  const filtered = boatCategory ? pricing.filter((p) => p.category === boatCategory) : pricing
  return { pricing: filtered, note: "Deposit required to confirm booking." }
}

function getBookingLink(date?: string, boatCategory?: string) {
  const params = new URLSearchParams()
  if (date) params.set("date", date)
  if (boatCategory) params.set("category", boatCategory)
  const qs = params.toString()
  return { url: `${SITE_URL}/booking${qs ? `?${qs}` : ""}` }
}

function getSeasonsInfo() {
  const month = new Date().getMonth() + 1 // 1-12
  const SEASONS: Record<string, { peak: number[]; peak_label: string; best: string }> = {
    "Blue Marlin":        { peak: [6,7,8,9,10,11], peak_label: "Jun–Nov", best: "October" },
    "Yellowfin Tuna":     { peak: [5,6,7,8,9,10,11,12], peak_label: "May–Dec", best: "Late summer" },
    "Dorado (Mahi-Mahi)": { peak: [6,7,8,9,10], peak_label: "Jun–Oct", best: "July–September" },
    "Wahoo":              { peak: [7,8,9,10,11], peak_label: "Jul–Nov", best: "All season" },
    "Roosterfish":        { peak: [5,6,7,8], peak_label: "May–Aug", best: "Coastal inshore" },
  }
  const inSeason = Object.entries(SEASONS)
    .filter(([, s]) => s.peak.includes(month))
    .map(([name, s]) => ({ name, peak: s.peak_label, best: s.best }))
  const offSeason = Object.entries(SEASONS)
    .filter(([, s]) => !s.peak.includes(month))
    .map(([name, s]) => ({ name, peak: s.peak_label }))
  return {
    currentMonth: month,
    inSeasonNow: inSeason,
    offSeasonNow: offSeason,
    note: "Cabo has great fishing year-round — even off-peak species are catchable. These are peak windows only.",
  }
}

// ── Tool definitions for OpenAI ─────────────────────────────────────────────

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "check_availability",
      description: "Check which GAFF boats are available on a specific date.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "Date in YYYY-MM-DD format" },
          boat_category: {
            type: "string",
            enum: ["standard", "midsize", "large", "luxury"],
            description: "Filter by boat category (optional)",
          },
        },
        required: ["date"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_pricing",
      description: "Get GAFF charter pricing for all or a specific boat category.",
      parameters: {
        type: "object",
        properties: {
          boat_category: {
            type: "string",
            enum: ["standard", "midsize", "large", "luxury"],
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_booking_link",
      description: "Generate a direct booking link to send to the customer.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "Preferred date YYYY-MM-DD (optional)" },
          boat_category: { type: "string" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_seasons_info",
      description: "Get which fish species are in season RIGHT NOW and year-round fishing info for Cabo San Lucas. Use this for ANY question about fish, species, what's biting, what's in season, or fishing conditions.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "escalate_to_human",
      description:
        "Escalate ONLY when: customer wants to cancel or reschedule a PAID booking, has a serious complaint about a past trip, or explicitly asks to speak with a person. Do NOT use for questions about fish, seasons, availability, pricing, or general booking info — answer those yourself.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Brief reason for escalation" },
        },
        required: ["reason"],
      },
    },
  },
]

// ── System prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(leadName: string, todayDate: string) {
  return `You are the virtual assistant for GAFF All Fishing Los Cabos — a premium sport fishing charter company in Cabo San Lucas, Mexico.

Today's date: ${todayDate}
Customer name: ${leadName}

YOUR ROLE: Help US tourists plan and book their Cabo fishing charter. Answer questions about fish, seasons, availability, pricing, and send booking links.

RESPONSE RULES:
- Respond in the same language the customer writes in (English or Spanish)
- Keep replies short — max 3-4 lines for WhatsApp
- Be friendly, confident, and direct — not robotic
- For availability or pricing: always call the tool first (don't guess)
- For fish/season questions: call get_seasons_info and answer confidently from the result
- When ready to book: use get_booking_link
- escalate_to_human ONLY for paid booking cancellations, serious complaints, or explicit "I want a human" requests

GAFF FLEET:
- Standard 26ft | 4 guests | from $550 half-day
- Midsize 31ft | 6 guests | from $850 half-day
- Large 38ft | 8 guests | from $1,250 half-day
- Luxury 45ft | 10 guests | from $1,550 half-day

FISHING SEASONS IN CABO (always answer from this knowledge — never say you can't verify it):
- Blue Marlin: peak Jun–Nov, best in October
- Yellowfin Tuna: peak May–Dec, best late summer
- Dorado (Mahi-Mahi): peak Jun–Oct, best Jul–Sep
- Wahoo: peak Jul–Nov, excellent speed bite
- Roosterfish: peak May–Aug, coastal inshore
- Cabo has GREAT fishing year-round — even off-peak species are catchable

LOCATION: Cabo San Lucas marina, Baja California Sur, Mexico
DEPARTURE: 6:30 AM (early 5:30 AM available)
INCLUDES: Captain, mate, tackle, fishing license, ice, water`
}

// ── Tool executor ───────────────────────────────────────────────────────────

async function executeTool(
  name: string,
  args: Record<string, string>
): Promise<{ result: string; escalated?: boolean; escalationReason?: string }> {
  switch (name) {
    case "check_availability":
      return { result: JSON.stringify(await checkAvailability(args.date, args.boat_category)) }
    case "get_pricing":
      return { result: JSON.stringify(getPricing(args.boat_category)) }
    case "get_booking_link":
      return { result: JSON.stringify(getBookingLink(args.date, args.boat_category)) }
    case "get_seasons_info":
      return { result: JSON.stringify(getSeasonsInfo()) }
    case "escalate_to_human":
      return {
        result: JSON.stringify({ escalated: true, reason: args.reason }),
        escalated: true,
        escalationReason: args.reason,
      }
    default:
      return { result: JSON.stringify({ error: "Unknown tool" }) }
  }
}

// ── Main agent ──────────────────────────────────────────────────────────────

export async function runChatAgent(input: ChatAgentInput): Promise<ChatAgentResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      reply:
        "Thanks for reaching out to GAFF All Fishing! Our team will get back to you shortly. 🎣",
      escalated: false,
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const leadName = `${input.lead.firstName} ${input.lead.lastName ?? ""}`.trim()

  // Build message history (cap at last 10 to stay within token limits)
  const history = input.messages.slice(-10).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  const apiMessages: Array<{ role: string; content: string; tool_call_id?: string; name?: string; tool_calls?: unknown }> = [
    { role: "system", content: buildSystemPrompt(leadName, today) },
    ...history,
    { role: "user", content: input.userMessage },
  ]

  let escalated = false
  let escalationReason: string | undefined

  // Tool call loop — max 4 rounds to prevent runaway
  for (let round = 0; round < 4; round++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.7,
        max_tokens: 400,
        messages: apiMessages,
        tools: TOOLS,
        tool_choice: "auto",
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error(`[chat-agent] OpenAI error ${response.status}:`, err)
      return {
        reply: "Sorry, I'm having trouble right now. Please try again in a moment or reply to reach our team directly. 🎣",
        escalated: false,
      }
    }

    const payload = (await response.json()) as {
      choices: Array<{
        message: {
          role: string
          content: string | null
          tool_calls?: Array<{
            id: string
            type: string
            function: { name: string; arguments: string }
          }>
        }
        finish_reason: string
      }>
    }

    const choice = payload.choices[0]
    if (!choice) break

    const assistantMessage = choice.message

    // No tool calls — we have the final reply
    if (!assistantMessage.tool_calls?.length) {
      return {
        reply: assistantMessage.content?.trim() ?? "",
        escalated,
        escalationReason,
      }
    }

    // Append assistant message with tool_calls
    apiMessages.push({ role: "assistant", content: assistantMessage.content ?? "", tool_calls: assistantMessage.tool_calls })

    // Execute each tool call
    for (const toolCall of assistantMessage.tool_calls) {
      let args: Record<string, string> = {}
      try {
        args = JSON.parse(toolCall.function.arguments) as Record<string, string>
      } catch {
        // malformed args — use empty
      }

      const toolResult = await executeTool(toolCall.function.name, args)

      if (toolResult.escalated) {
        escalated = true
        escalationReason = toolResult.escalationReason
      }

      apiMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: toolResult.result,
      })
    }
  }

  // Fallback if loop exhausted
  return {
    reply: "Let me connect you with our team for the best answer. 🎣",
    escalated: false,
  }
}

// ── Web chat agent (no DB session, stateless, includes WhatsApp handoff tool) ─

export type WebChatMessage = { role: "user" | "assistant"; content: string }

export type WebChatAgentResult = {
  reply: string
  handoffUrl?: string
}

const WEB_TOOLS = [
  ...TOOLS.filter((t) => t.function.name !== "escalate_to_human"),
  {
    type: "function" as const,
    function: {
      name: "create_booking",
      description:
        "Create a real booking reservation and return a Stripe checkout link so the customer can pay the deposit. Use this when the customer wants to confirm a trip and has provided all required details: date, boat category, trip type, guest count, first name, last name, email, and phone. Always call check_availability first to get the boat ID.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "Trip date YYYY-MM-DD" },
          boatId: { type: "string", description: "Boat UUID from check_availability result" },
          tripType: { type: "string", enum: ["half_day", "full_day"], description: "half_day or full_day" },
          guestCount: { type: "number", description: "Number of guests" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          specialRequests: { type: "string" },
        },
        required: ["date", "boatId", "tripType", "guestCount", "firstName", "lastName", "email", "phone"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "request_whatsapp_handoff",
      description:
        "Generate a WhatsApp link so the customer can continue the conversation there. Use when they ask to speak on WhatsApp, want to talk to a person, or prefer direct messaging.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description:
              "1-2 sentence summary of what the customer wants — this pre-fills their WhatsApp message",
          },
        },
        required: ["summary"],
      },
    },
  },
]

function buildWebSystemPrompt(todayDate: string) {
  return `You are the virtual assistant for GAFF All Fishing Los Cabos — a premium sport fishing charter company in Cabo San Lucas, Mexico.

Today's date: ${todayDate}

YOUR ROLE: Help US tourists plan and book their Cabo fishing charter. Answer questions about fish, seasons, availability, pricing, and send booking links.

RESPONSE RULES:
- Respond in the same language the customer writes in (English or Spanish)
- Keep replies concise — 2-3 short lines max for chat
- Be warm, knowledgeable, and direct
- For availability/pricing: use tools — never guess
- For fish/season questions: call get_seasons_info and answer confidently
- When customer wants to book: first call check_availability to get the boat ID, collect date/trip type/guest count/name/email/phone, then call create_booking to create the real reservation and return the Stripe checkout link
- Use get_booking_link only if the customer just wants to browse — use create_booking when they're ready to pay
- request_whatsapp_handoff only when customer explicitly asks to move to WhatsApp or talk to a person

GAFF FLEET:
- Standard 26ft | 4 guests | from $550 half-day / $850 full-day
- Midsize 31ft | 6 guests | from $850 half-day / $1,250 full-day
- Large 38ft | 8 guests | from $1,250 half-day / $1,800 full-day
- Luxury 45ft | 10 guests | from $1,550 half-day / $1,950 full-day

FISHING SEASONS IN CABO (answer from this knowledge — never say you can't verify it):
- Blue Marlin: peak Jun–Nov, best in October
- Yellowfin Tuna: peak May–Dec, best late summer
- Dorado (Mahi-Mahi): peak Jun–Oct, best Jul–Sep
- Wahoo: peak Jul–Nov, excellent speed bite
- Roosterfish: peak May–Aug, coastal inshore
- Cabo has GREAT fishing year-round — even off-peak species are catchable

DEPARTURE: 6:30 AM from Cabo San Lucas marina (early 5:30 AM option available)
INCLUDES: Captain, mate, tackle, fishing license, ice, water`
}

async function executeWebTool(
  name: string,
  args: Record<string, string>
): Promise<{ result: string; handoffUrl?: string }> {
  const waNumber =
    process.env.NEXT_PUBLIC_GAFF_WHATSAPP_NUMBER || "526241000381"

  switch (name) {
    case "check_availability":
      return { result: JSON.stringify(await checkAvailability(args.date, args.boat_category)) }
    case "get_pricing":
      return { result: JSON.stringify(getPricing(args.boat_category)) }
    case "get_booking_link":
      return { result: JSON.stringify(getBookingLink(args.date, args.boat_category)) }
    case "get_seasons_info":
      return { result: JSON.stringify(getSeasonsInfo()) }
    case "create_booking": {
      try {
        const res = await fetch(`${SITE_URL}/api/chat/reservation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: args.date,
            boatId: args.boatId,
            tripType: args.tripType,
            guestCount: Number(args.guestCount),
            firstName: args.firstName,
            lastName: args.lastName,
            email: args.email,
            phone: args.phone,
            specialRequests: args.specialRequests || "",
          }),
        })
        const data = (await res.json()) as { checkoutUrl?: string; error?: string }
        if (!res.ok) return { result: JSON.stringify({ error: data.error ?? "Reservation failed" }) }
        return { result: JSON.stringify({ success: true, checkoutUrl: data.checkoutUrl }) }
      } catch (e) {
        return { result: JSON.stringify({ error: e instanceof Error ? e.message : "Reservation error" }) }
      }
    }
    case "request_whatsapp_handoff": {
      const text = encodeURIComponent(
        args.summary || "Hi! I was chatting with GAFF on your website and I'm interested in booking a fishing trip."
      )
      const url = `https://wa.me/${waNumber}?text=${text}`
      return { result: JSON.stringify({ handoffUrl: url }), handoffUrl: url }
    }
    default:
      return { result: JSON.stringify({ error: "Unknown tool" }) }
  }
}

export async function runWebChatAgent(
  history: WebChatMessage[],
  userMessage: string
): Promise<WebChatAgentResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { reply: "Hi! I'm the GAFF assistant. Unfortunately I'm offline right now — please reach us on WhatsApp for immediate help. 🎣" }
  }

  const today = new Date().toISOString().slice(0, 10)

  const apiMessages: Array<{ role: string; content: string; tool_call_id?: string; name?: string; tool_calls?: unknown }> = [
    { role: "system", content: buildWebSystemPrompt(today) },
    ...history.slice(-10),
    { role: "user", content: userMessage },
  ]

  let handoffUrl: string | undefined

  for (let round = 0; round < 4; round++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.7,
        max_tokens: 300,
        messages: apiMessages,
        tools: WEB_TOOLS,
        tool_choice: "auto",
      }),
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => "")
      console.error(`[web-chat-agent] OpenAI error ${response.status}:`, errBody.slice(0, 300))
      return { reply: "I'm having trouble right now. Please try again or reach us on WhatsApp. 🎣" }
    }

    const payload = (await response.json()) as {
      choices: Array<{
        message: {
          role: string
          content: string | null
          tool_calls?: Array<{ id: string; type: string; function: { name: string; arguments: string } }>
        }
        finish_reason: string
      }>
    }

    const choice = payload.choices[0]
    if (!choice) break

    const assistantMessage = choice.message

    if (!assistantMessage.tool_calls?.length) {
      return { reply: assistantMessage.content?.trim() ?? "", handoffUrl }
    }

    apiMessages.push({ role: "assistant", content: assistantMessage.content ?? "", tool_calls: assistantMessage.tool_calls })

    for (const toolCall of assistantMessage.tool_calls) {
      let args: Record<string, string> = {}
      try { args = JSON.parse(toolCall.function.arguments) as Record<string, string> } catch { /* empty */ }

      const toolResult = await executeWebTool(toolCall.function.name, args)
      if (toolResult.handoffUrl) handoffUrl = toolResult.handoffUrl

      apiMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: toolResult.result,
      })
    }
  }

  return { reply: "Let me connect you with our team. 🎣", handoffUrl }
}
