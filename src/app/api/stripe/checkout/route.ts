import { NextResponse } from "next/server"

import { getPendingBookingForCheckout } from "@/lib/booking/create-booking"
import { getStripeServerClient } from "@/lib/stripe"

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 503 }
    )
  }

  try {
    const { bookingId } = (await request.json()) as { bookingId?: string }

    if (!bookingId) {
      throw new Error("bookingId is required.")
    }

    const booking = await getPendingBookingForCheckout(bookingId)
    const stripe = getStripeServerClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${siteUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/booking?bookingId=${booking.id}&cancelled=true`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: `${booking.boatName} - ${booking.tripType.replace("_", " ")} trip`,
              description: `${booking.guests} guests on ${booking.date.toISOString().slice(0, 10)}`,
            },
            unit_amount: Math.round(Number(booking.depositAmount ?? "0") * 100),
          },
        },
      ],
      metadata: {
        bookingId: booking.id,
        leadId: booking.leadId ?? "",
        boatId: booking.boatId,
        tripDate: booking.date.toISOString().slice(0, 10),
        tripType: booking.tripType,
      },
      payment_intent_data: {
        metadata: {
          bookingId: booking.id,
          leadId: booking.leadId ?? "",
          boatId: booking.boatId,
          tripDate: booking.date.toISOString().slice(0, 10),
          tripType: booking.tripType,
        },
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create Stripe checkout."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
