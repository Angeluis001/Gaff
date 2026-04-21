import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"

import { formatDateTime } from "./formatters"

export async function getAdminReviewsOverview() {
  const rows = (await db.select().from(reviews)).sort((left, right) => {
    const leftDate = left.reviewDate ? new Date(left.reviewDate).getTime() : 0
    const rightDate = right.reviewDate ? new Date(right.reviewDate).getTime() : 0
    return rightDate - leftDate
  })

  const summary = rows.reduce<Record<string, number>>((accumulator, review) => {
    const key = review.platform ?? "unknown"
    accumulator[key] = (accumulator[key] ?? 0) + 1
    return accumulator
  }, {})

  const lowStarReviews = rows.filter((review) => (review.rating ?? 0) > 0 && (review.rating ?? 0) <= 3)
  const pendingDrafts = rows.filter((review) => review.responseStatus === "draft")

  return {
    summary,
    alerts: {
      lowStarCount: lowStarReviews.length,
      pendingDraftCount: pendingDrafts.length,
      latestLowStarReviews: lowStarReviews.slice(0, 5).map((review) => ({
        id: review.id,
        platform: review.platform,
        rating: review.rating,
        authorName: review.authorName,
        reviewDate: review.reviewDate ? formatDateTime(review.reviewDate) : null,
      })),
    },
    reviews: rows.map((review) => ({
      id: review.id,
      platform: review.platform,
      rating: review.rating,
      authorName: review.authorName,
      responseStatus: review.responseStatus ?? "pending",
      reviewDate: review.reviewDate ? formatDateTime(review.reviewDate) : null,
      content: review.content,
      responseContent: review.responseContent,
    })),
  }
}
