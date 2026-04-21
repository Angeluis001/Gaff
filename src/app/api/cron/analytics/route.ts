import { NextResponse } from "next/server"

import {
  buildAnalyticsReport,
  sendAnalyticsAlertDigest,
  sendDailyAnalyticsReport,
  sendWeeklyAnalyticsReport,
} from "@/lib/analytics-agent"

function isAuthorizedCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production"
  }

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  const headerToken = request.headers.get("x-cron-secret")?.trim()

  return bearerToken === cronSecret || headerToken === cronSecret
}

function getScope(request: Request) {
  const url = new URL(request.url)
  const scope = url.searchParams.get("scope")?.trim().toLowerCase()

  if (scope === "daily" || scope === "weekly" || scope === "alerts") {
    return scope
  }

  return "all"
}

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const scope = getScope(request)
    const report = await buildAnalyticsReport()

    const response: Record<string, unknown> = {
      received: true,
      scope,
      alertsCount: report.alerts.length,
      dashboard: report.dashboard,
    }

    if (scope === "daily" || scope === "all") {
      await sendDailyAnalyticsReport()
      response.dailySent = true
    }

    if (scope === "weekly" || scope === "all") {
      await sendWeeklyAnalyticsReport()
      response.weeklySent = true
    }

    if (scope === "alerts" || scope === "all") {
      const result = await sendAnalyticsAlertDigest()
      response.alertDigestSent = Boolean(result)
    }

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to run analytics cron."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return POST(request)
}
