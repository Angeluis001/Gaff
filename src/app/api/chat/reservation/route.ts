import { NextResponse } from "next/server"

import {
  createPendingBooking,
  getPendingBookingForCheckout,
} from "@/lib/booking/create-booking"
import { createBookingCheckoutSession, getCheckoutSiteUrl } from "@/lib/booking/checkout"
import { ratelimit } from "@/lib/ratelimit"
import type { BookingFormData } from "@/types/booking"

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured for live booking writes." },
      { status: 503 }
    )
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 503 }
    )
  }

  if (ratelimit) {
    const result = await ratelimit.limit(`chat-reservation:${getClientIp(request)}`)

    if (!result.success) {
      return NextResponse.json(
        { error: "Too many reservation attempts. Please wait a moment and try again." },
        { status: 429 }
      )
    }
  }

  try {
    const payload = (await request.json()) as BookingFormData
    const booking = await createPendingBooking(payload, { source: "whatsapp" })
    const bookingForCheckout = await getPendingBookingForCheckout(booking.bookingId)
    const checkout = await createBookingCheckoutSession(
      {
        id: bookingForCheckout.id,
        leadId: bookingForCheckout.leadId,
        boatId: bookingForCheckout.boatId,
        date: bookingForCheckout.date,
        tripType: bookingForCheckout.tripType,
        guests: bookingForCheckout.guests,
        depositAmount: bookingForCheckout.depositAmount,
        boatName: bookingForCheckout.boatName,
      },
      getCheckoutSiteUrl(request)
    )

    return NextResponse.json(
      {
        bookingId: booking.bookingId,
        leadId: booking.leadId,
        totalPrice: booking.totalPrice,
        depositAmount: booking.depositAmount,
        checkoutSessionId: checkout.id,
        checkoutUrl: checkout.url,
        source: "whatsapp",
      },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create the reservation."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
