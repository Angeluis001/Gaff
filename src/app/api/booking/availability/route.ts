import { NextResponse } from "next/server"

import { getBookingAvailability } from "@/lib/booking/availability"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured for live booking availability." },
      { status: 503 }
    )
  }

  try {
    const payload = await getBookingAvailability()

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load booking availability."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
