import { db } from "@/lib/db"
import { marketingPosts, seoPosts } from "@/lib/db/schema"

type MarketingPost = typeof marketingPosts.$inferSelect

function sortByScheduledAt(left: MarketingPost, right: MarketingPost) {
  const leftDate = left.scheduledAt ? new Date(left.scheduledAt).getTime() : 0
  const rightDate = right.scheduledAt ? new Date(right.scheduledAt).getTime() : 0
  return leftDate - rightDate
}

function buildCaption(post: MarketingPost) {
  const hashtags = post.hashtags ?? []
  const tagLine = hashtags.length > 0 ? hashtags.map((tag) => `#${tag.replace(/^#/, "")}`).join(" ") : ""
  return [post.content, tagLine].filter(Boolean).join("\n\n")
}

export async function getWeeklyMarketingCalendar() {
  const rows = await db.select().from(marketingPosts)
  const posts = rows.sort(sortByScheduledAt)

  return posts.map((post) => ({
    id: post.id,
    platform: post.platform,
    status: post.status ?? "draft",
    caption: buildCaption(post),
    hashtags: post.hashtags ?? [],
    scheduledAt: post.scheduledAt ?? null,
    publishedAt: post.publishedAt ?? null,
    platformPostId: post.platformPostId ?? null,
  }))
}

export async function buildEngagementDrafts() {
  const [marketingRows, seoRows] = await Promise.all([db.select().from(marketingPosts), db.select().from(seoPosts)])

  const replyDrafts = marketingRows
    .filter((post) => post.status === "published")
    .slice(0, 5)
    .map((post) => ({
      postId: post.id,
      platform: post.platform,
      draft:
        "Thanks for the support. Ask about current Cabo conditions, boat options, or the next available charter window.",
    }))

  const seoCrossPromotions = seoRows
    .filter((post) => post.status === "published" || post.status === "scheduled")
    .slice(0, 5)
    .map((post) => ({
      postId: post.id,
      title: post.title,
      draft: `Cross-promote this ${post.kind.replace("_", " ")} with a short booking hook and trip call to action.`,
    }))

  return {
    replyDrafts,
    seoCrossPromotions,
  }
}

export async function getMarketingQueueSummary() {
  const rows = await db.select().from(marketingPosts)
  const queue = rows.sort(sortByScheduledAt)

  const summary = {
    total: queue.length,
    draftCount: queue.filter((post) => (post.status ?? "draft") === "draft").length,
    scheduledCount: queue.filter((post) => post.status === "scheduled").length,
    publishedCount: queue.filter((post) => post.status === "published").length,
    failedCount: queue.filter((post) => post.status === "failed").length,
    nextScheduledAt: queue.find((post) => post.status === "scheduled" && post.scheduledAt)?.scheduledAt ?? null,
    queueHealth: "healthy" as "healthy" | "warning" | "blocked",
  }

  if (summary.failedCount > 0) {
    summary.queueHealth = "blocked"
  } else if (summary.draftCount > 0 && summary.scheduledCount === 0) {
    summary.queueHealth = "warning"
  }

  return {
    summary,
    calendar: queue.map((post) => ({
      id: post.id,
      platform: post.platform,
      status: post.status ?? "draft",
      scheduledAt: post.scheduledAt ?? null,
      publishedAt: post.publishedAt ?? null,
      platformPostId: post.platformPostId ?? null,
      hashtags: post.hashtags ?? [],
      caption: buildCaption(post),
    })),
    engagementDrafts: await buildEngagementDrafts(),
  }
}
