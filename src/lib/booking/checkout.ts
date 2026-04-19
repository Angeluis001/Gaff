import { getStripeServerClient } from "@/lib/stripe"

export type PendingCheckoutBooking = {
  id: string
  leadId: string | null
  boatId: string
  date: Date
  tripType: string
  guests: number
  depositAmount: string | number | null
  boatName: string
}

export function getCheckoutSiteUrl(request: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  const forwardedProto = request.headers.get("x-forwarded-proto")
  const forwardedHost = request.headers.get("x-forwarded-host")

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}

export async function createBookingCheckoutSession(
  booking: PendingCheckoutBooking,
  siteUrl: string
) {
  const stripe = getStripeServerClient()

  return stripe.checkout.sessions.create({
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
}
