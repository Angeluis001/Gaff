import { and, eq, gte, isNull, lt } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { bookings, leadActivities, leads } from "@/lib/db/schema"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

function requireCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== "production"
  const auth = request.headers.get("authorization") ?? ""
  return auth === `Bearer ${secret}`
}

export async function POST(request: Request) {
  if (!requireCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const now = new Date()

  // Calculate "yesterday" in Mazatlan time (UTC-7)
  const mxParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mazatlan",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  const mxYear = Number(mxParts.find((p) => p.type === "year")!.value)
  const mxMonth = Number(mxParts.find((p) => p.type === "month")!.value) - 1
  const mxDay = Number(mxParts.find((p) => p.type === "day")!.value)

  const yesterdayMx = new Date(mxYear, mxMonth, mxDay - 1)
  const yesterdayDate = [
    yesterdayMx.getFullYear(),
    String(yesterdayMx.getMonth() + 1).padStart(2, "0"),
    String(yesterdayMx.getDate()).padStart(2, "0"),
  ].join("-")

  const windowStart = new Date(`${yesterdayDate}T00:00:00.000Z`)
  const windowEnd = new Date(`${yesterdayDate}T23:59:59.999Z`)

  const completedBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "completed"),
        gte(bookings.date, windowStart),
        lt(bookings.date, windowEnd),
        isNull(bookings.reviewRequestSentAt)
      )
    )

  const googleReviewUrl = process.env.GOOGLE_REVIEW_URL ?? "https://g.page/r/review"

  let sentCount = 0
  let skippedCount = 0

  for (const booking of completedBookings) {
    if (!booking.leadId) {
      skippedCount++
      continue
    }

    const [lead] = await db.select().from(leads).where(eq(leads.id, booking.leadId))
    if (!lead) {
      skippedCount++
      continue
    }

    const whatsappTo = lead.whatsappNumber ?? lead.phone
    if (!whatsappTo || !process.env.OPENCLAW_URL) {
      skippedCount++
      continue
    }

    const customerName = `${lead.firstName} ${lead.lastName ?? ""}`.trim()
    const message =
      `🎣 *Thanks for fishing with GAFF All Fishing, ${customerName}!*\n\n` +
      `We hope your trip was everything you dreamed of.\n\n` +
      `Would you mind leaving us a quick Google review? It only takes 2 minutes and helps other anglers find us:\n\n` +
      `⭐ ${googleReviewUrl}\n\n` +
      `See you on the water again soon! 🌊`

    try {
      await sendWhatsAppMessage(whatsappTo, message)

      await db
        .update(bookings)
        .set({ reviewRequestSentAt: new Date() })
        .where(eq(bookings.id, booking.id))

      await db.insert(leadActivities).values({
        leadId: lead.id,
        type: "whatsapp_sent",
        description: `Review request sent after completed trip on ${yesterdayDate}.`,
        metadata: { bookingId: booking.id, channel: "whatsapp" },
        agentId: "review-request-cron",
      })

      sentCount++
    } catch (err) {
      console.error(`[review-request] Failed for booking ${booking.id}:`, err)
      skippedCount++
    }
  }

  return NextResponse.json({
    received: true,
    date: yesterdayDate,
    sentCount,
    skippedCount,
  })
}
