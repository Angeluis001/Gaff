import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getPendingBookingForCheckout } from "@/lib/booking/create-booking"
import { db } from "@/lib/db"
import { boatAvailability, bookings, leads } from "@/lib/db/schema"
import { sendBookingConfirmationEmail } from "@/lib/resend"
import { getStripeServerClient } from "@/lib/stripe"
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

      if (lead?.email && process.env.RESEND_API_KEY) {
        await sendBookingConfirmationEmail({
          to: lead.email,
          subject: `Booking confirmed: ${booking.boatName} on ${booking.date
            .toISOString()
            .slice(0, 10)}`,
          react: BookingConfirmationEmail({
            customerName: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
            boatName: booking.boatName,
            tripDate: booking.date.toISOString().slice(0, 10),
            tripType: booking.tripType.replace("_", " "),
            guestCount: booking.guests,
            depositAmount: booking.depositAmount ?? "0.00",
          }),
        })
      }
    }

    return NextResponse.json({ received: true, replayed: isReplay })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process Stripe webhook."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
