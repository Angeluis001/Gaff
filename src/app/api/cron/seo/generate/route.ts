import { NextResponse } from "next/server"

import { ensureWeeklySeoContent, generateFishingReportFromBooking } from "@/lib/seo/generator"
import { db } from "@/lib/db"
import { bookings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

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
    const weeklyPost = await ensureWeeklySeoContent()
    const completedBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, "completed"))

    const generatedReports = []

    for (const booking of completedBookings.slice(0, 5)) {
      generatedReports.push(await generateFishingReportFromBooking(booking.id))
    }

    return NextResponse.json({
      received: true,
      weeklyPost,
      generatedReportCount: generatedReports.length,
      generatedReports,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate SEO content."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return POST(request)
}

