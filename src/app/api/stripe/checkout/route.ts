import { NextResponse } from "next/server"

import { getPendingBookingForCheckout } from "@/lib/booking/create-booking"
import { createBookingCheckoutSession, getCheckoutSiteUrl } from "@/lib/booking/checkout"

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
    const siteUrl = getCheckoutSiteUrl(request)
    const session = await createBookingCheckoutSession(booking, siteUrl)

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
