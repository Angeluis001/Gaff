import { and, eq, gte } from "drizzle-orm"

import { db } from "@/lib/db"
import { bookings, boats, seoPosts } from "@/lib/db/schema"

import { getSeoKeywordTargets } from "./reports"

const SEO_SYSTEM_PROMPT =
  "You are an SEO content writer for GAFF All Fishing, a premium sport fishing charter in Cabo San Lucas, Mexico. Write in a knowledgeable, premium tone targeting US sport fishing tourists. Use natural keyword integration — never keyword-stuffed. Include practical details that would help a visitor planning a Cabo trip."

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function getUniqueSlug(baseSlug: string) {
  return `${baseSlug}-${new Date().toISOString().slice(0, 10)}`
}

function currentWeekKeyword() {
  const keywords = getSeoKeywordTargets()
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  return keywords[weekNumber % keywords.length]
}

async function callGpt(userPrompt: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: SEO_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string | null } }> }
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch {
    return null
  }
}

async function weeklyPostAlreadyExists(keyword: string): Promise<boolean> {
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const existing = await db
    .select({ id: seoPosts.id })
    .from(seoPosts)
    .where(and(eq(seoPosts.kind, "blog_post"), eq(seoPosts.keywordFocus, keyword), gte(seoPosts.createdAt, weekStart)))
    .limit(1)
  return existing.length > 0
}

export async function generateWeeklySeoPost() {
  const keyword = currentWeekKeyword()

  if (await weeklyPostAlreadyExists(keyword)) {
    return null
  }

  const gptContent = await callGpt(
    `Write an 800-1000 word SEO blog post for the keyword "${keyword}". ` +
      `Title format: "Cabo Fishing Guide: [engaging subtitle]". ` +
      `Include sections on: best season, target species (yellowfin tuna, marlin, dorado), ` +
      `what to expect on a GAFF charter, and a call-to-action to book. ` +
      `Return only the blog post body — no markdown headers for the title.`
  )

  const title = `Cabo fishing guide: ${keyword}`
  const excerpt = `Everything you need to know about ${keyword} — species, seasons, and booking your GAFF charter.`
  const content =
    gptContent ??
    [
      `This week's report targets the keyword "${keyword}".`,
      "Cover recent offshore conditions, boat availability context, and the best species to target.",
      "Keep the tone practical, premium, and useful for visiting anglers searching for Cabo trips.",
    ].join("\n\n")

  const [saved] = await db
    .insert(seoPosts)
    .values({
      kind: "blog_post",
      title,
      slug: getUniqueSlug(slugify(title)),
      excerpt,
      content,
      keywordFocus: keyword,
      competitorFocus: "piscessportfishing.com",
      status: "draft",
      scheduledAt: new Date(),
      metadata: {
        cadence: "weekly",
        generatedBy: gptContent ? "gpt-4o-mini" : "template",
        source: "keyword-planning",
      },
      updatedAt: new Date(),
    })
    .returning()

  return saved
}

export async function generateFishingReportFromBooking(bookingId: string) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1)

  if (!booking) throw new Error("Booking not found.")
  if (booking.status !== "completed") throw new Error("Fishing reports can only be generated from completed bookings.")

  const [boat] = booking.boatId
    ? await db.select({ name: boats.name, captainName: boats.captainName }).from(boats).where(eq(boats.id, booking.boatId)).limit(1)
    : []

  const tripDate = booking.date.toISOString().slice(0, 10)
  const tripContext = {
    tripType: booking.tripType,
    guests: booking.guests,
    date: tripDate,
    boatName: boat?.name ?? "charter vessel",
    captainName: boat?.captainName ?? null,
    fishCaught: booking.fishCaught ?? [],
    specialRequests: booking.specialRequests ?? null,
  }

  const gptContent = await callGpt(
    `Write a 400-600 word fishing report for a completed GAFF charter trip. ` +
      `Trip data: ${JSON.stringify(tripContext)}. ` +
      `Include: conditions offshore, target species for that season, any fish caught (if listed), ` +
      `the experience on board, and a recommendation for future guests. ` +
      `Keyword to integrate naturally: "cabo fishing report". Return only the report body.`
  )

  const title = `Fishing report: ${booking.tripType.replace("_", " ")} on ${tripDate}`
  const content =
    gptContent ??
    [
      `Completed trip report for booking ${booking.id}.`,
      `Trip type: ${booking.tripType} · Guests: ${booking.guests} · Date: ${tripDate}.`,
      "Offshore conditions were favorable. Target species included yellowfin tuna and dorado.",
    ].join("\n\n")

  const [saved] = await db
    .insert(seoPosts)
    .values({
      kind: "fishing_report",
      title,
      slug: getUniqueSlug(slugify(title)),
      excerpt: `${booking.tripType.replace("_", " ")} charter out of Cabo San Lucas on ${tripDate} — conditions, catch, and highlights.`,
      content,
      keywordFocus: "cabo fishing report",
      competitorFocus: "piscessportfishing.com",
      sourceBookingId: booking.id,
      status: "draft",
      scheduledAt: new Date(),
      metadata: {
        bookingId: booking.id,
        tripType: booking.tripType,
        guests: booking.guests,
        generatedBy: gptContent ? "gpt-4o-mini" : "template",
      },
      updatedAt: new Date(),
    })
    .returning()

  return saved
}

export async function ensureWeeklySeoContent() {
  return generateWeeklySeoPost()
}
