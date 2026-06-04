import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getPendingBookingForCheckout } from "@/lib/booking/create-booking"
import { db } from "@/lib/db"
import { boatAvailability, bookings, leadFollowupSteps, leads } from "@/lib/db/schema"
import { sendBookingConfirmationEmail } from "@/lib/resend"
import { getStripeServerClient } from "@/lib/stripe"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { BookingConfirmationEmail } from "@/emails/BookingConfirmationEmail"

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    )
  }

  try {
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      throw new Error("Missing Stripe signature header.")
    }

    const rawBody = await request.text()
    const stripe = getStripeServerClient()
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true })
    }

    const session = event.data.object
    const bookingId = session.metadata?.bookingId

    if (!bookingId) {
      throw new Error("Stripe session did not include a bookingId.")
    }

    const booking = await getPendingBookingForCheckout(bookingId)

    const isReplay = booking.status === "deposit_paid"

    if (!isReplay) {
      await db
        .update(bookings)
        .set({
          status: "deposit_paid",
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          depositPaidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId))
    }

    await db
      .insert(boatAvailability)
      .values({
        boatId: booking.boatId,
        bookingId: booking.id,
        date: booking.date,
        isAvailable: false,
        reason: "booked",
      })
      .onConflictDoUpdate({
        target: [boatAvailability.boatId, boatAvailability.date],
        set: {
          bookingId: booking.id,
          isAvailable: false,
          reason: "booked",
        },
      })

    if (!isReplay && booking.leadId) {
      const [lead] = await db.select().from(leads).where(eq(leads.id, booking.leadId))

      if (lead) {
        await db
          .update(leads)
          .set({ status: "booked", updatedAt: new Date() })
          .where(eq(leads.id, lead.id))

        const customerName = `${lead.firstName} ${lead.lastName ?? ""}`.trim()
        const tripDate = booking.date.toISOString().slice(0, 10)
        const tripType = booking.tripType.replace("_", " ")

        const notifications: Promise<unknown>[] = []

        if (lead.email && process.env.RESEND_API_KEY) {
          notifications.push(
            sendBookingConfirmationEmail({
              to: lead.email,
              subject: `Booking confirmed: ${booking.boatName} on ${tripDate}`,
              react: BookingConfirmationEmail({
                customerName,
                boatName: booking.boatName,
                tripDate,
                tripType,
                guestCount: booking.guests,
                depositAmount: booking.depositAmount ?? "0.00",
              }),
            })
          )
        }

        const whatsappTo = lead.whatsappNumber ?? lead.phone
        console.log(`[webhook] whatsappTo=${whatsappTo} OPENCLAW_URL=${process.env.OPENCLAW_URL?.slice(0, 40)}`)
        if (whatsappTo && process.env.OPENCLAW_URL) {
          const tripTypeLabel = tripType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
          const waMessage =
            `🎣 *GAFF All Fishing Los Cabos*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `✅ *Booking Confirmed!*\n\n` +
            `Hi ${customerName}! Your deposit is in and your charter is locked. See you on the water!\n\n` +
            `*Trip Details*\n` +
            `🚤 Vessel: ${booking.boatName}\n` +
            `📅 Date: ${tripDate}\n` +
            `⏱ Type: ${tripTypeLabel}\n` +
            `👥 Guests: ${booking.guests}\n` +
            `💰 Deposit paid: $${booking.depositAmount ?? "0.00"}\n\n` +
            `*Meeting Point*\n` +
            `📍 Cabo San Lucas Marina\n` +
            `🕡 Arrive by 6:15 AM · Departure 6:30 AM\n\n` +
            `We'll message you 48 hrs before with final details. Questions? Just reply here! 👋`
          notifications.push(sendWhatsAppMessage(whatsappTo, waMessage))
        }

        const notifResults = await Promise.allSettled(notifications)
        notifResults.forEach((r, i) => {
          if (r.status === "rejected") {
            console.error(`[webhook] notification[${i}] failed:`, r.reason)
          }
        })

        // Schedule upsell message 48h after booking confirmed
        const upsellDueAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
        await db.insert(leadFollowupSteps).values({
          leadId: lead.id,
          classification: lead.classification ?? "warm",
          channel: "whatsapp",
          subject: "Upsell post-booking",
          message:
            `🎣 *Your GAFF trip is confirmed — want to make it even better?*\n\n` +
            `Hi ${customerName}, we have a few options to upgrade your experience on ${tripDate}:\n\n` +
            `📸 *Professional photography* — high-quality fishing shots to keep forever\n` +
            `🦐 *Premium live bait package* — gives you the edge for marlin and tuna\n` +
            `🌅 *Early departure (5:30 AM)* — more time on the water, better bite\n\n` +
            `Interested in any of these? Just reply and we'll add it to your trip.`,
          stepIndex: 99,
          dueAt: upsellDueAt,
        }).onConflictDoNothing()
      }
    }

    return NextResponse.json({ received: true, replayed: isReplay })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process Stripe webhook."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
