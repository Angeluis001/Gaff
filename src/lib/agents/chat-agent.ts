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
  return {
    species: [
      { name: "Blue Marlin", peak: "Jun–Nov", best: "October" },
      { name: "Yellowfin Tuna", peak: "May–Dec", best: "Late summer" },
      { name: "Dorado (Mahi-Mahi)", peak: "Jun–Oct", best: "July–September" },
      { name: "Wahoo", peak: "Jul–Nov", best: "Fast bite all season" },
      { name: "Roosterfish", peak: "May–Aug", best: "Coastal waters" },
    ],
    note: "Cabo has great fishing year-round. We can match your travel dates to the best bite window.",
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
      description: "Get fishing seasons and species information for Cabo San Lucas.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "escalate_to_human",
      description:
        "Escalate to a human team member. Use when: customer wants to cancel or reschedule a paid booking, has an urgent complaint, or needs something beyond general booking info.",
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

YOUR ROLE: Help US tourists plan and book their Cabo fishing charter. You can answer questions, check availability, share pricing, and send booking links.

RESPONSE RULES:
- Respond in the same language the customer writes in (English or Spanish)
- Keep replies short — max 3-4 lines for WhatsApp
- Be friendly, confident, and direct — not robotic
- Always use tools before giving availability or pricing info (don't guess)
- When the customer is ready to book, use get_booking_link to give them the direct link
- Use escalate_to_human if they want to cancel a paid booking, have a complaint, or need urgent help

GAFF FLEET SUMMARY:
- Standard 26ft | 4 guests | from $550 half-day
- Midsize 31ft | 6 guests | from $850 half-day
- Large 38ft | 8 guests | from $1,250 half-day
- Luxury 45ft | 10 guests | from $1,550 half-day

LOCATION: Cabo San Lucas marina, Baja California Sur, Mexico
DEPARTURE: 6:30 AM (early option 5:30 AM available)
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
