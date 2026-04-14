import { NextResponse } from "next/server"

import { getLandingAvailabilityPayload } from "@/lib/landing-data"

export async function GET() {
  return NextResponse.json(getLandingAvailabilityPayload(), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
