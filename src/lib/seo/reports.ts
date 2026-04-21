import { db } from "@/lib/db"
import { bookings, seoPosts } from "@/lib/db/schema"

const SEO_KEYWORDS = [
  "cabo san lucas fishing",
  "sport fishing cabo",
  "marlin fishing cabo",
  "los cabos fishing charter",
]

export function getSeoKeywordTargets() {
  return SEO_KEYWORDS
}

export function buildKeywordReport() {
  return SEO_KEYWORDS.map((keyword, index) => ({
    keyword,
    gaffRank: index + 1,
    competitorRank: index + 2,
    trend: index === 0 ? "up" : "steady",
  }))
}

export async function getSeoReportSummary() {
  const [seoRows, bookingRows] = await Promise.all([db.select().from(seoPosts), db.select().from(bookings)])

  const completedBookings = bookingRows.filter((booking) => booking.status === "completed")
  const fishingReports = seoRows.filter((post) => post.kind === "fishing_report")
  const blogPosts = seoRows.filter((post) => post.kind === "blog_post")

  return {
    postCount: seoRows.length,
    blogPostCount: blogPosts.length,
    fishingReportCount: fishingReports.length,
    completedTripCount: completedBookings.length,
    latestPost: seoRows
      .sort((left, right) => {
        const leftDate = left.updatedAt ? new Date(left.updatedAt).getTime() : 0
        const rightDate = right.updatedAt ? new Date(right.updatedAt).getTime() : 0
        return rightDate - leftDate
      })
      .slice(0, 1)[0] ?? null,
    keywordReport: buildKeywordReport(),
  }
}

