import { db } from "@/lib/db"
import { marketingPosts } from "@/lib/db/schema"
import { getAdsSummary } from "@/lib/social/ads"
import { getMarketingQueueSummary } from "@/lib/social/engagement"

import { formatDateTime } from "./formatters"

export async function getAdminMarketingOverview() {
  const [rows, queue, ads] = await Promise.all([db.select().from(marketingPosts), getMarketingQueueSummary(), getAdsSummary()])

  const sortedRows = rows.sort((left, right) => {
    const leftDate = left.scheduledAt ? new Date(left.scheduledAt).getTime() : 0
    const rightDate = right.scheduledAt ? new Date(right.scheduledAt).getTime() : 0
    return rightDate - leftDate
  })

  return {
    posts: sortedRows.map((post) => ({
      id: post.id,
      platform: post.platform,
      status: post.status ?? "draft",
      scheduledAt: post.scheduledAt ? formatDateTime(post.scheduledAt) : null,
      publishedAt: post.publishedAt ? formatDateTime(post.publishedAt) : null,
      platformPostId: post.platformPostId ?? null,
      content: post.content,
      hashtags: post.hashtags ?? [],
      engagement: post.engagement ?? null,
    })),
    queue,
    ads,
  }
}
