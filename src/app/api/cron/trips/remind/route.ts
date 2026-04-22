import { and, eq, gte, lt } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { bookings, boats, leads } from "@/lib/db/schema"
import { redis } from "@/lib/redis"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

function isAuthorizedCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) return process.env.NODE_ENV !== "production"
  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  const headerToken = request.headers.get("x-cron-secret")?.trim()
  return bearerToken === cronSecret || headerToken === cronSecret
}

function formatTripType(tripType: string) {
  return tripType === "full_day" ? "Full Day" : tripType === "half_day" ? "Half Day" : tripType
}

function buildReminderMessage(params: {
  firstName: string
  boatName: string
  captainName: string | null
  tripDate: Date
  tripType: string
  guests: number
}) {
  const date = params.tripDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Mazatlan",
  })

  return [
    `Hi ${params.firstName}! 🎣 Your GAFF fishing trip is in 2 days — here's everything you need:`,
    ``,
    `📅 *Date:* ${date}`,
    `🚢 *Boat:* ${params.boatName}`,
    `🎣 *Trip:* ${formatTripType(params.tripType)} | ${params.guests} guests`,
    params.captainName ? `👨‍✈️ *Captain:* ${params.captainName}` : null,
    ``,
    `📍 *Meeting point:* Cabo San Lucas Marina, Dock F`,
    `🕕 *Departure:* 6:00 AM sharp — please arrive 15 min early`,
    ``,
    `🎒 *What to bring:*`,
    `• Sunscreen & sunglasses`,
    `• Hat & light jacket`,
    `• Seasickness medication (if needed)`,
    `• Camera`,
    `• Cash for gratuity`,
    ``,
    `🌊 Check conditions: windfinder.com/forecast/cabo_san_lucas`,
    ``,
    `Any questions? Reply here or call us anytime. See you on the water! 🐟`,
  ]
    .filter((line) => line !== null)
    .join("\n")
}

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  // Find bookings with date = today + 2 days (MX time)
  const now = new Date()
  const targetStart = new Date(now)
  targetStart.setDate(targetStart.getDate() + 2)
  targetStart.setHours(0, 0, 0, 0)
  const targetEnd = new Date(targetStart)
  targetEnd.setDate(targetEnd.getDate() + 1)

  const upcoming = await db
    .select({
      id: bookings.id,
      date: bookings.date,
      tripType: bookings.tripType,
      guests: bookings.guests,
      leadId: bookings.leadId,
      boatId: bookings.boatId,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "deposit_paid"),
        gte(bookings.date, targetStart),
        lt(bookings.date, targetEnd)
      )
    )

  if (upcoming.length === 0) {
    return NextResponse.json({ received: true, processedCount: 0, processed: [] })
  }

  const processed: Array<{ bookingId: string; status: string }> = []

  for (const booking of upcoming) {
    const reminderKey = `gaff:trip-reminder:${booking.id}`

    // Skip if already sent
    if (redis) {
      const alreadySent = await redis.get(reminderKey)
      if (alreadySent) {
        processed.push({ bookingId: booking.id, status: "already_sent" })
        continue
      }
    }

    if (!booking.leadId) {
      processed.push({ bookingId: booking.id, status: "skipped_no_lead" })
      continue
    }

    const [lead] = await db
      .select({ firstName: leads.firstName, phone: leads.phone, whatsappNumber: leads.whatsappNumber })
      .from(leads)
      .where(eq(leads.id, booking.leadId))
      .limit(1)

    const to = lead?.whatsappNumber ?? lead?.phone
    if (!to) {
      processed.push({ bookingId: booking.id, status: "skipped_no_phone" })
      continue
    }

    const [boat] = await db
      .select({ name: boats.name, captainName: boats.captainName })
      .from(boats)
      .where(eq(boats.id, booking.boatId))
      .limit(1)

    const message = buildReminderMessage({
      firstName: lead.firstName,
      boatName: boat?.name ?? "your charter",
      captainName: boat?.captainName ?? null,
      tripDate: booking.date,
      tripType: booking.tripType,
      guests: booking.guests,
    })

    try {
      await sendWhatsAppMessage(to, message)

      if (redis) {
        // Mark sent — expire after 3 days so key auto-cleans
        await redis.set(reminderKey, "1", { ex: 60 * 60 * 24 * 3 })
      }

      processed.push({ bookingId: booking.id, status: "sent" })
    } catch (err) {
      processed.push({ bookingId: booking.id, status: "error" })
      console.error(`[trip-remind] failed bookingId=${booking.id}`, err)
    }
  }

  return NextResponse.json({
    received: true,
    processedCount: processed.filter((p) => p.status === "sent").length,
    processed,
  })
}
