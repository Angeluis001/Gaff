import { NextResponse } from "next/server"

import { createPendingBooking } from "@/lib/booking/create-booking"
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

  if (ratelimit) {
    const result = await ratelimit.limit(`booking:${getClientIp(request)}`)

    if (!result.success) {
      return NextResponse.json(
        { error: "Too many booking attempts. Please wait a moment and try again." },
        { status: 429 }
      )
    }
  }

  try {
    const payload = (await request.json()) as BookingFormData
    const booking = await createPendingBooking(payload)

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create the pending booking."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
