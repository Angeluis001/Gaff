import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { marketingPosts } from "@/lib/db/schema"

type MarketingPost = typeof marketingPosts.$inferSelect

export interface TikTokPublishResult {
  platform: "tiktok"
  platformPostId: string
  publishedAt: Date
  dryRun: boolean
}

function getTikTokConfig() {
  return {
    accessToken: process.env.TIKTOK_ACCESS_TOKEN?.trim() ?? "",
    publishEndpoint: process.env.TIKTOK_PUBLISH_ENDPOINT?.trim() ?? "https://open.tiktokapis.com/v2/post/publish/content/init/",
    advertiserId: process.env.TIKTOK_ADVERTISER_ID?.trim() ?? "",
  }
}

export function getTikTokPublishingReadiness() {
  const config = getTikTokConfig()

  return {
    configured: Boolean(config.accessToken),
    accessToken: Boolean(config.accessToken),
    publishEndpoint: config.publishEndpoint,
    advertiserId: Boolean(config.advertiserId),
  }
}

function buildPlatformPostId(post: MarketingPost) {
  return `tiktok-${post.id}`
}

async function publishToTikTokApi(post: MarketingPost): Promise<TikTokPublishResult> {
  const config = getTikTokConfig()

  if (!config.accessToken) {
    return {
      platform: "tiktok",
      platformPostId: buildPlatformPostId(post),
      publishedAt: new Date(),
      dryRun: true,
    }
  }

  const response = await fetch(config.publishEndpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      text: post.content,
      hashtags: post.hashtags ?? [],
      media_urls: post.mediaUrls ?? [],
      advertiser_id: config.advertiserId || undefined,
    }),
  })

  if (!response.ok) {
    const payload = await response.text()
    throw new Error(`TikTok publish failed: ${response.status} ${payload}`)
  }

  const data = (await response.json()) as { data?: { post_id?: string; publish_id?: string } }

  return {
    platform: "tiktok",
    platformPostId: data.data?.post_id ?? data.data?.publish_id ?? buildPlatformPostId(post),
    publishedAt: new Date(),
    dryRun: false,
  }
}

export async function publishMarketingPostToTikTok(post: MarketingPost) {
  const result = await publishToTikTokApi(post)

  const [updated] = await db
    .update(marketingPosts)
    .set({
      status: "published",
      publishedAt: result.publishedAt,
      platformPostId: result.platformPostId,
    })
    .where(eq(marketingPosts.id, post.id))
    .returning()

  return {
    post: updated,
    result,
  }
}
