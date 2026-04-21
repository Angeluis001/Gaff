import { db } from "@/lib/db"
import { boatAvailability, bookings, boats, leadActivities, leads } from "@/lib/db/schema"
import { buildAnalyticsReport } from "@/lib/analytics-agent"

import { formatCurrency } from "./formatters"

const REVENUE_STATUSES = new Set(["deposit_paid", "confirmed", "in_progress", "completed"])
const OCCUPIED_STATUSES = new Set(["deposit_paid", "confirmed", "in_progress", "completed"])
const CONTACT_ACTIVITY_TYPES = new Set(["email_sent", "whatsapp_sent", "call", "contacted"])
const HOT_LEAD_ALERT_WINDOW_MS = 2 * 60 * 60 * 1000

export interface AdminDashboardData {
  metrics: {
    totalBookings: number
    revenue: string
    leads: number
    occupancyRate: number
    activeBoats: number
    depositPaidBookings: number
  }
  statusBreakdown: Record<string, number>
  leadAlerts: {
    hotLeadCount: number
    staleHotLeadCount: number
    staleHotLeads: Array<{
      id: string
      name: string
      source: string
      createdAt: string
      minutesWaiting: number
      latestContactAt: string | null
    }>
  }
  analytics: {
    dailyBookings: number
    dailyLeads: number
    dailyRevenue: string
    weeklyBookingCount: number
    weeklyLeadCount: number
    leadConversionRate: number
    previousLeadConversionRate: number
    reviewAverage: number | null
    alertCount: number
    queueHealth: "healthy" | "warning" | "blocked"
    seoPosts: number
  }
}

const FALLBACK_ANALYTICS: AdminDashboardData["analytics"] = {
  dailyBookings: 0,
  dailyLeads: 0,
  dailyRevenue: formatCurrency(0),
  weeklyBookingCount: 0,
  weeklyLeadCount: 0,
  leadConversionRate: 0,
  previousLeadConversionRate: 0,
  reviewAverage: null,
  alertCount: 0,
  queueHealth: "warning",
  seoPosts: 0,
}

async function getActivityRowsSafe() {
  try {
    return await db.select().from(leadActivities)
  } catch (error) {
    console.error("Admin dashboard could not load lead activities", error)
    return []
  }
}

async function getAnalyticsReportSafe() {
  try {
    return await buildAnalyticsReport()
  } catch (error) {
    console.error("Admin dashboard could not load analytics report", error)
    return null
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [bookingRows, leadRows, boatRows, availabilityRows, activityRows, analyticsReport] = await Promise.all([
    db.select().from(bookings),
    db.select().from(leads),
    db.select().from(boats),
    db.select().from(boatAvailability),
    getActivityRowsSafe(),
    getAnalyticsReportSafe(),
  ])

  const statusBreakdown = bookingRows.reduce<Record<string, number>>((accumulator, booking) => {
    const key = booking.status ?? "pending"
    accumulator[key] = (accumulator[key] ?? 0) + 1
    return accumulator
  }, {})

  const revenueTotal = bookingRows.reduce((sum, booking) => {
    if (!REVENUE_STATUSES.has(booking.status ?? "")) {
      return sum
    }

    return sum + Number(booking.totalPrice ?? 0)
  }, 0)

  const occupancyEvents = availabilityRows.filter((row) => {
    if (row.isAvailable === false) {
      return true
    }

    return OCCUPIED_STATUSES.has(
      bookingRows.find((booking) => booking.id === row.bookingId)?.status ?? ""
    )
  }).length

  const occupancyRate =
    boatRows.length > 0 ? Math.min(1, occupancyEvents / Math.max(boatRows.length * 30, 1)) : 0

  const now = Date.now()
  const hotLeads = leadRows.filter((lead) => lead.classification === "hot")
  const staleHotLeadCandidates = hotLeads
    .map((lead) => {
      const relatedActivities = activityRows.filter((activity) => activity.leadId === lead.id)
      const contactActivity = relatedActivities
        .filter((activity) => CONTACT_ACTIVITY_TYPES.has(activity.type))
        .sort((left, right) => {
          const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0
          const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0
          return rightDate - leftDate
        })[0]
      const latestContactAt = contactActivity?.createdAt
        ? new Date(contactActivity.createdAt).toISOString()
        : null
      const anchorTime = latestContactAt
        ? new Date(latestContactAt).getTime()
        : lead.createdAt
          ? new Date(lead.createdAt).getTime()
          : now
      const minutesWaiting = Math.max(0, Math.round((now - anchorTime) / 60000))

      return {
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
        source: lead.source,
        createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString() : new Date().toISOString(),
        minutesWaiting,
        latestContactAt,
        stale: now - anchorTime >= HOT_LEAD_ALERT_WINDOW_MS,
      }
    })
    .filter((lead) => lead.stale)
    .sort((left, right) => right.minutesWaiting - left.minutesWaiting)

  return {
    metrics: {
      totalBookings: bookingRows.length,
      revenue: formatCurrency(revenueTotal),
      leads: leadRows.length,
      occupancyRate,
      activeBoats: boatRows.filter((boat) => boat.isActive !== false).length,
      depositPaidBookings: bookingRows.filter((booking) => booking.status === "deposit_paid").length,
    },
    statusBreakdown,
    leadAlerts: {
      hotLeadCount: hotLeads.length,
      staleHotLeadCount: staleHotLeadCandidates.length,
      staleHotLeads: staleHotLeadCandidates.map((lead) => ({
        id: lead.id,
        name: lead.name,
        source: lead.source,
        createdAt: lead.createdAt,
        minutesWaiting: lead.minutesWaiting,
        latestContactAt: lead.latestContactAt,
      })),
    },
    analytics: {
      dailyBookings: analyticsReport?.dashboard.dailyBookings ?? FALLBACK_ANALYTICS.dailyBookings,
      dailyLeads: analyticsReport?.dashboard.dailyLeads ?? FALLBACK_ANALYTICS.dailyLeads,
      dailyRevenue: analyticsReport?.dashboard.dailyRevenue ?? FALLBACK_ANALYTICS.dailyRevenue,
      weeklyBookingCount:
        analyticsReport?.dashboard.weeklyBookingCount ?? FALLBACK_ANALYTICS.weeklyBookingCount,
      weeklyLeadCount: analyticsReport?.dashboard.weeklyLeadCount ?? FALLBACK_ANALYTICS.weeklyLeadCount,
      leadConversionRate:
        analyticsReport?.dashboard.leadConversionRate ?? FALLBACK_ANALYTICS.leadConversionRate,
      previousLeadConversionRate:
        analyticsReport?.dashboard.previousLeadConversionRate ??
        FALLBACK_ANALYTICS.previousLeadConversionRate,
      reviewAverage: analyticsReport?.dashboard.reviewAverage ?? FALLBACK_ANALYTICS.reviewAverage,
      alertCount: analyticsReport?.dashboard.openAlerts ?? FALLBACK_ANALYTICS.alertCount,
      queueHealth: analyticsReport?.dashboard.marketingQueue.queueHealth ?? FALLBACK_ANALYTICS.queueHealth,
      seoPosts: analyticsReport?.dashboard.seoSummary.postCount ?? FALLBACK_ANALYTICS.seoPosts,
    },
  }
}
