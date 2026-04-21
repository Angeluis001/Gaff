import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { bookings, seoPosts } from "@/lib/db/schema"

import { getSeoKeywordTargets } from "./reports"

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

function buildWeeklyBlogPost() {
  const keyword = getSeoKeywordTargets()[0]
  const title = `Weekly Cabo fishing report: ${keyword}`
  const excerpt =
    "A weekly GAFF fishing update covering conditions, target species, and the best current trip window."

  return {
    kind: "blog_post",
    title,
    slug: getUniqueSlug(slugify(title)),
    excerpt,
    content: [
      `This week's report targets the keyword "${keyword}".`,
      "Share recent offshore conditions, boat availability context, and the best species to target.",
      "Keep the tone practical, premium, and useful for visiting anglers searching for Cabo trips.",
    ].join("\n\n"),
    keywordFocus: keyword,
    competitorFocus: "piscessportfishing.com",
    status: "draft",
    metadata: {
      cadence: "weekly",
      generatedBy: "seo-agent",
      source: "keyword-planning",
    },
  } as const
}

export async function generateWeeklySeoPost() {
  const post = buildWeeklyBlogPost()

  const [saved] = await db
    .insert(seoPosts)
    .values({
      ...post,
      scheduledAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return saved
}

export async function generateFishingReportFromBooking(bookingId: string) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1)

  if (!booking) {
    throw new Error("Booking not found.")
  }

  if (booking.status !== "completed") {
    throw new Error("Fishing reports can only be generated from completed bookings.")
  }

  const title = `Fishing report: ${booking.tripType.replace("_", " ")} on ${booking.date
    .toISOString()
    .slice(0, 10)}`
  const content = [
    `Completed trip report for booking ${booking.id}.`,
    `Trip type: ${booking.tripType}.`,
    `Guests: ${booking.guests}.`,
    "Summarize weather, target species, and catch highlights in a search-friendly format.",
  ].join("\n\n")

  const [saved] = await db
    .insert(seoPosts)
    .values({
      kind: "fishing_report",
      title,
      slug: getUniqueSlug(slugify(title)),
      excerpt: `Fishing report generated from completed trip ${booking.id}.`,
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
      },
      updatedAt: new Date(),
    })
    .returning()

  return saved
}

export async function ensureWeeklySeoContent() {
  return generateWeeklySeoPost()
}
