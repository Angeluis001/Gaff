import { db } from "@/lib/db"
import { bookings, seoPosts } from "@/lib/db/schema"
import { getSeoReportSummary } from "@/lib/seo/reports"

import { formatDateTime } from "./formatters"

export async function getAdminSeoOverview() {
  const [bookingRows, seoRows, reportSummary] = await Promise.all([
    db.select().from(bookings),
    db.select().from(seoPosts),
    getSeoReportSummary(),
  ])

  const completedBookings = bookingRows.filter((booking) => booking.status === "completed")
  const sortedSeoRows = seoRows.sort((left, right) => {
    const leftDate = left.updatedAt ? new Date(left.updatedAt).getTime() : 0
    const rightDate = right.updatedAt ? new Date(right.updatedAt).getTime() : 0
    return rightDate - leftDate
  })

  return {
    weeklyReports: completedBookings.length,
    totalSeoPosts: seoRows.length,
    blogPostCount: reportSummary.blogPostCount,
    fishingReportCount: reportSummary.fishingReportCount,
    latestPost: reportSummary.latestPost
      ? {
          id: reportSummary.latestPost.id,
          kind: reportSummary.latestPost.kind,
          title: reportSummary.latestPost.title,
          status: reportSummary.latestPost.status ?? "draft",
          publishedAt: reportSummary.latestPost.publishedAt ? formatDateTime(reportSummary.latestPost.publishedAt) : null,
          scheduledAt: reportSummary.latestPost.scheduledAt ? formatDateTime(reportSummary.latestPost.scheduledAt) : null,
        }
      : null,
    keywordReport: reportSummary.keywordReport,
    recentCompletedTrips: completedBookings.slice(0, 5).map((booking) => ({
      id: booking.id,
      date: formatDateTime(booking.date),
      tripType: booking.tripType,
      status: booking.status ?? "pending",
    })),
    recentSeoPosts: sortedSeoRows.slice(0, 10).map((post) => ({
      id: post.id,
      slug: post.slug,
      kind: post.kind,
      title: post.title,
      status: post.status ?? "draft",
      excerpt: post.excerpt ?? null,
      content: post.content,
      keywordFocus: post.keywordFocus ?? null,
      publishedAt: post.publishedAt ? formatDateTime(post.publishedAt) : null,
      scheduledAt: post.scheduledAt ? formatDateTime(post.scheduledAt) : null,
    })),
  }
}
