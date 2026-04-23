import { and, eq, gte, isNull, lt } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { bookings, boats, leads } from "@/lib/db/schema"
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

  const now = new Date()

  // Calculate "today" in Mexico timezone (Mazatlan = UTC-7 / UTC-6 DST)
  // Vercel runs in UTC so without this, midnight crossovers shift the target day by one.
  const mxParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mazatlan",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now)
  const mxYear = Number(mxParts.find((p) => p.type === "year")!.value)
  const mxMonth = Number(mxParts.find((p) => p.type === "month")!.value) - 1
  const mxDay = Number(mxParts.find((p) => p.type === "day")!.value)

  // Trip date 2 days from now in Mexico calendar
  const targetMx = new Date(mxYear, mxMonth, mxDay + 2)
  const targetDate = [
    targetMx.getFullYear(),
    String(targetMx.getMonth() + 1).padStart(2, "0"),
    String(targetMx.getDate()).padStart(2, "0"),
  ].join("-")

  // Full UTC day range covering that Mexico calendar date
  const targetStart = new Date(`${targetDate}T00:00:00.000Z`)
  const targetEnd = new Date(`${targetDate}T23:59:59.999Z`)

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
        lt(bookings.date, targetEnd),
        isNull(bookings.reminderSentAt)
      )
    )

  if (upcoming.length === 0) {
    return NextResponse.json({ received: true, processedCount: 0, processed: [] })
  }

  const processed: Array<{ bookingId: string; status: string }> = []

  for (const booking of upcoming) {
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
      await db.update(bookings).set({ reminderSentAt: now }).where(eq(bookings.id, booking.id))
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
