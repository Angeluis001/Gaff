import { and, eq, gte } from "drizzle-orm"

import { db } from "@/lib/db"
import { bookings, boats, seoPosts } from "@/lib/db/schema"

import { getSeoKeywordTargets } from "./reports"

const SEO_SYSTEM_PROMPT = `You are an SEO content writer for GAFF All Fishing Los Cabos — a premium sport fishing charter targeting US tourists who search Google and ask AI assistants like ChatGPT and Perplexity for Cabo fishing recommendations.

CONTENT STRUCTURE (apply to every post):
- Opening paragraph: direct answer to the search query in the first 2 sentences — write as a citable fact ("Best time for blue marlin in Cabo San Lucas: October through November, peak season")
- Sections: H2/H3 listicle or how-to format so AI can extract discrete answers
- FAQ section: minimum 3 Q&A pairs targeting related long-tail searches (e.g., "What fish can you catch in Cabo in October?")
- CTA: end with a specific booking invitation — "Book your Cabo charter at gaffallfishingloscabos.com before peak dates fill"

PROGRAMMATIC SEO URL PATTERN (fishing reports):
- Slug format: [species]-fishing-cabo-[month]-[year] (e.g., marlin-fishing-cabo-october-2026)
- Use real trip data — species caught, date, boat — as unique data competitors cannot replicate

AI VISIBILITY (make content citable by ChatGPT, Perplexity, Google AI Overviews):
- Include specific data points with numbers ("Yellowfin tuna peaks May–December in Cabo, best late summer")
- Use definition blocks for species and seasons (what they are, when they run, where in Cabo)
- Source claims to GAFF real trip data when available ("Based on GAFF charter data, October 2026...")

TONE: knowledgeable, premium, practical. Write for the angler planning their trip, not a search crawler. Never keyword-stuffed.`

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

function getFishingReportSlug(
  fishCaught: { species: string; weight?: string; released: boolean }[] | null | undefined,
  tripDate: string,
  bookingId: string
): string {
  const speciesName = fishCaught && fishCaught.length > 0 ? fishCaught[0].species : "offshore"
  const speciesSlug = slugify(speciesName)
  const date = new Date(tripDate)
  const month = date.toLocaleString("en-US", { month: "long" }).toLowerCase()
  const year = date.getFullYear()
  const bookingPrefix = bookingId.slice(0, 8)
  return `${speciesSlug}-fishing-cabo-${month}-${year}-${bookingPrefix}`
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
      slug: getFishingReportSlug(booking.fishCaught, tripDate, booking.id),
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
