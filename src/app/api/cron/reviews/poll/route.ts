import { NextResponse } from "next/server"

import { pollReviewFeeds } from "@/lib/reviews/polling"
import { syncReviewSnapshot } from "@/lib/reviews/sync"

function isAuthorizedCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production"
  }

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  const headerToken = request.headers.get("x-cron-secret")?.trim()

  return bearerToken === cronSecret || headerToken === cronSecret
}

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const snapshots = await pollReviewFeeds()
    const synced = []

    for (const snapshot of snapshots) {
      synced.push(await syncReviewSnapshot(snapshot))
    }

    return NextResponse.json({
      received: true,
      syncedCount: synced.length,
      synced,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to poll reviews."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return POST(request)
}

