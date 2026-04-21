import { createElement } from "react"

import { eq } from "drizzle-orm"

import { AnalyticsReportEmail } from "@/emails/AnalyticsReportEmail"
import { db } from "@/lib/db"
import { adminUsers, bookings, boats, leads, reviews } from "@/lib/db/schema"
import { sendTransactionalEmail } from "@/lib/resend"
import { getSeoReportSummary } from "@/lib/seo/reports"
import { getMarketingQueueSummary } from "@/lib/social/engagement"

const REVENUE_STATUSES = new Set(["deposit_paid", "confirmed", "in_progress", "completed"])
const BOAT_IDLE_DAYS = Number(process.env.ANALYTICS_BOAT_IDLE_DAYS ?? 3)
const LEAD_CONVERSION_DROP_THRESHOLD = Number(process.env.ANALYTICS_LEAD_DROP_THRESHOLD ?? 0.2)
const REVIEW_SCORE_THRESHOLD = Number(process.env.ANALYTICS_REVIEW_SCORE_THRESHOLD ?? 4.5)

type AnalyticsAlert = {
  type: "boat_idle" | "lead_conversion_drop" | "review_score"
  severity: "warning" | "danger"
  title: string
  detail: string
}

type AnalyticsHighlight = {
  label: string
  value: string
}

export type AnalyticsReport = {
  title: string
  period: string
  summary: string
  highlights: AnalyticsHighlight[]
  alerts: AnalyticsAlert[]
}

function toTime(value: Date | string | null | undefined) {
  if (!value) {
    return null
  }

  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

function sumRevenue(items: Array<{ totalPrice: unknown; status?: string | null }>) {
  return items.reduce((sum, booking) => {
    if (!REVENUE_STATUSES.has(booking.status ?? "")) {
      return sum
    }

    return sum + Number(booking.totalPrice ?? 0)
  }, 0)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function rangeStart(now: Date, daysBack: number) {
  const date = new Date(now)
  date.setDate(date.getDate() - daysBack)
  date.setHours(0, 0, 0, 0)
  return date
}

async function getReportRecipient() {
  const envRecipient = process.env.ANALYTICS_REPORT_EMAIL?.trim() || process.env.ADMIN_BOOTSTRAP_EMAIL?.trim()
  if (envRecipient) {
    return envRecipient
  }

  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.isActive, true)).limit(1)
  return admin?.email ?? null
}

export async function buildAnalyticsReport(now = new Date()): Promise<{
  daily: AnalyticsReport
  weekly: AnalyticsReport
  alerts: AnalyticsAlert[]
  dashboard: {
    totalBookings: number
    totalLeads: number
    revenue: string
    occupancyRate: number
    reviewAverage: number | null
    reviewCount: number
    openAlerts: number
    activeBoats: number
    dailyBookings: number
    dailyLeads: number
    dailyRevenue: string
    weeklyBookingCount: number
    weeklyLeadCount: number
    leadConversionRate: number
    previousLeadConversionRate: number
    marketingQueue: Awaited<ReturnType<typeof getMarketingQueueSummary>>["summary"]
    seoSummary: Awaited<ReturnType<typeof getSeoReportSummary>>
  }
}> {
  const [bookingRows, leadRows, boatRows, reviewRows, marketingSummary, seoSummary] = await Promise.all([
    db.select().from(bookings),
    db.select().from(leads),
    db.select().from(boats),
    db.select().from(reviews),
    getMarketingQueueSummary(),
    getSeoReportSummary(),
  ])

  const totalBookings = bookingRows.length
  const totalLeads = leadRows.length
  const totalRevenueValue = sumRevenue(bookingRows)

  const occupancyEvents = bookingRows.filter((booking) => REVENUE_STATUSES.has(booking.status ?? "")).length
  const occupancyRate = boatRows.length > 0 ? Math.min(1, occupancyEvents / Math.max(boatRows.length * 30, 1)) : 0

  const today = new Date(now)
  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)
  const yesterdayStart = rangeStart(todayStart, 1)
  const last7Start = rangeStart(todayStart, 7)
  const prev7Start = rangeStart(last7Start, 7)

  const bookingsYesterday = bookingRows.filter((booking) => {
    const createdAt = toTime(booking.createdAt)
    return createdAt !== null && createdAt >= yesterdayStart.getTime() && createdAt < todayStart.getTime()
  })
  const leadsYesterday = leadRows.filter((lead) => {
    const createdAt = toTime(lead.createdAt)
    return createdAt !== null && createdAt >= yesterdayStart.getTime() && createdAt < todayStart.getTime()
  })

  const weeklyBookings = bookingRows.filter((booking) => {
    const createdAt = toTime(booking.createdAt)
    return createdAt !== null && createdAt >= last7Start.getTime() && createdAt < todayStart.getTime()
  })
  const previousWeeklyBookings = bookingRows.filter((booking) => {
    const createdAt = toTime(booking.createdAt)
    return createdAt !== null && createdAt >= prev7Start.getTime() && createdAt < last7Start.getTime()
  })
  const weeklyLeads = leadRows.filter((lead) => {
    const createdAt = toTime(lead.createdAt)
    return createdAt !== null && createdAt >= last7Start.getTime() && createdAt < todayStart.getTime()
  })
  const previousWeeklyLeads = leadRows.filter((lead) => {
    const createdAt = toTime(lead.createdAt)
    return createdAt !== null && createdAt >= prev7Start.getTime() && createdAt < last7Start.getTime()
  })

  const dailyRevenueValue = sumRevenue(bookingsYesterday)
  const weeklyRevenueValue = sumRevenue(weeklyBookings)

  const currentLeadConversionRate = weeklyLeads.length > 0 ? weeklyBookings.length / weeklyLeads.length : 0
  const previousLeadConversionRate =
    previousWeeklyLeads.length > 0 ? previousWeeklyBookings.length / previousWeeklyLeads.length : 0

  const alerts: AnalyticsAlert[] = []
  const nowTime = now.getTime()
  const idleCutoff = nowTime - BOAT_IDLE_DAYS * 24 * 60 * 60 * 1000

  for (const boat of boatRows.filter((item) => item.isActive !== false)) {
    const lastBookingDate = bookingRows
      .filter((booking) => booking.boatId === boat.id && booking.date)
      .sort((left, right) => {
        const leftDate = toTime(left.date) ?? 0
        const rightDate = toTime(right.date) ?? 0
        return rightDate - leftDate
      })[0]?.date
    const lastBookingTime = toTime(lastBookingDate)

    if (!lastBookingTime || lastBookingTime < idleCutoff) {
      alerts.push({
        type: "boat_idle",
        severity: "warning",
        title: `${boat.name} idle`,
        detail: lastBookingTime
          ? `Last booking was ${Math.floor((nowTime - lastBookingTime) / (24 * 60 * 60 * 1000))} days ago.`
          : "No bookings have been recorded for this boat yet.",
      })
    }
  }

  if (previousLeadConversionRate > 0) {
    const drop = (previousLeadConversionRate - currentLeadConversionRate) / previousLeadConversionRate
    if (drop > LEAD_CONVERSION_DROP_THRESHOLD) {
      alerts.push({
        type: "lead_conversion_drop",
        severity: "danger",
        title: "Lead conversion rate drop",
        detail: `Current 7-day conversion is ${formatPercent(currentLeadConversionRate)} vs ${formatPercent(previousLeadConversionRate)} in the prior period.`,
      })
    }
  }

  const reviewRatings = reviewRows
    .filter((review) => typeof review.rating === "number")
    .map((review) => review.rating ?? 0)
  const reviewAverage =
    reviewRatings.length > 0 ? reviewRatings.reduce((sum, rating) => sum + rating, 0) / reviewRatings.length : null
  if (reviewAverage !== null && reviewAverage < REVIEW_SCORE_THRESHOLD) {
    alerts.push({
      type: "review_score",
      severity: "danger",
      title: "Review score below target",
      detail: `Average review score is ${reviewAverage.toFixed(1)}, below the ${REVIEW_SCORE_THRESHOLD.toFixed(1)} target.`,
    })
  }

  const daily: AnalyticsReport = {
    title: "GAFF Daily Analytics Report",
    period: `${yesterdayStart.toLocaleDateString("en-US")} to ${todayStart.toLocaleDateString("en-US")}`,
    summary: "Daily performance summary for bookings, leads, and revenue.",
    highlights: [
      { label: "Bookings yesterday", value: String(bookingsYesterday.length) },
      { label: "Leads yesterday", value: String(leadsYesterday.length) },
      { label: "Revenue yesterday", value: formatCurrency(dailyRevenueValue) },
      { label: "Occupancy rate", value: formatPercent(occupancyRate) },
    ],
    alerts,
  }

  const weekly: AnalyticsReport = {
    title: "GAFF Weekly Analytics Report",
    period: `${last7Start.toLocaleDateString("en-US")} to ${todayStart.toLocaleDateString("en-US")}`,
    summary: "Weekly performance summary for marketing, SEO, and lead conversion movement.",
    highlights: [
      { label: "Weekly bookings", value: String(weeklyBookings.length) },
      { label: "Weekly leads", value: String(weeklyLeads.length) },
      { label: "Weekly revenue", value: formatCurrency(weeklyRevenueValue) },
      { label: "Marketing queue", value: `${marketingSummary.summary.scheduledCount} scheduled` },
      { label: "SEO content", value: `${seoSummary.postCount} posts` },
      { label: "Lead conversion", value: formatPercent(currentLeadConversionRate) },
    ],
    alerts,
  }

  return {
    daily,
    weekly,
    alerts,
    dashboard: {
      totalBookings,
      totalLeads,
      revenue: formatCurrency(totalRevenueValue),
      occupancyRate,
      reviewAverage,
      reviewCount: reviewRows.length,
      openAlerts: alerts.length,
      activeBoats: boatRows.filter((boat) => boat.isActive !== false).length,
      dailyBookings: bookingsYesterday.length,
      dailyLeads: leadsYesterday.length,
      dailyRevenue: formatCurrency(dailyRevenueValue),
      weeklyBookingCount: weeklyBookings.length,
      weeklyLeadCount: weeklyLeads.length,
      leadConversionRate: currentLeadConversionRate,
      previousLeadConversionRate,
      marketingQueue: marketingSummary.summary,
      seoSummary,
    },
  }
}

export async function sendDailyAnalyticsReport() {
  const recipient = await getReportRecipient()
  if (!recipient) {
    throw new Error("No analytics report recipient configured.")
  }

  const report = await buildAnalyticsReport()
  return sendTransactionalEmail({
    to: recipient,
    subject: report.daily.title,
    react: createElement(AnalyticsReportEmail, {
      title: report.daily.title,
      period: report.daily.period,
      summary: report.daily.summary,
      highlights: report.daily.highlights,
      alerts: report.alerts,
    }),
  })
}

export async function sendWeeklyAnalyticsReport() {
  const recipient = await getReportRecipient()
  if (!recipient) {
    throw new Error("No analytics report recipient configured.")
  }

  const report = await buildAnalyticsReport()
  return sendTransactionalEmail({
    to: recipient,
    subject: report.weekly.title,
    react: createElement(AnalyticsReportEmail, {
      title: report.weekly.title,
      period: report.weekly.period,
      summary: report.weekly.summary,
      highlights: report.weekly.highlights,
      alerts: report.alerts,
    }),
  })
}

export async function sendAnalyticsAlertDigest() {
  const recipient = await getReportRecipient()
  if (!recipient) {
    throw new Error("No analytics report recipient configured.")
  }

  const report = await buildAnalyticsReport()
  if (report.alerts.length === 0) {
    return null
  }

  return sendTransactionalEmail({
    to: recipient,
    subject: "GAFF Analytics Alert Digest",
    react: createElement(AnalyticsReportEmail, {
      title: "GAFF Analytics Alert Digest",
      period: `Generated ${new Date().toLocaleString("en-US")}`,
      summary: "One or more analytics thresholds need attention.",
      highlights: report.weekly.highlights.slice(0, 3),
      alerts: report.alerts,
    }),
  })
}
