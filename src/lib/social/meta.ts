import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { marketingPosts } from "@/lib/db/schema"

type MarketingPost = typeof marketingPosts.$inferSelect

export interface MetaPublishResult {
  platform: "meta"
  platformPostId: string
  publishedAt: Date
  dryRun: boolean
}

function getMetaConfig() {
  return {
    appId: process.env.META_APP_ID?.trim() ?? "",
    appSecret: process.env.META_APP_SECRET?.trim() ?? "",
    pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN?.trim() ?? "",
    pageId: process.env.META_PAGE_ID?.trim() ?? "",
    graphVersion: process.env.META_GRAPH_API_VERSION?.trim() ?? "v19.0",
  }
}

export function getMetaPublishingReadiness() {
  const config = getMetaConfig()

  return {
    configured: Boolean(config.pageAccessToken && config.pageId),
    appId: Boolean(config.appId),
    appSecret: Boolean(config.appSecret),
    pageAccessToken: Boolean(config.pageAccessToken),
    pageId: Boolean(config.pageId),
    graphVersion: config.graphVersion,
  }
}

function buildPlatformPostId(post: MarketingPost) {
  return `meta-${post.platform}-${post.id}`
}

async function publishToMetaApi(post: MarketingPost): Promise<MetaPublishResult> {
  const config = getMetaConfig()

  if (!config.pageAccessToken || !config.pageId) {
    return {
      platform: "meta",
      platformPostId: buildPlatformPostId(post),
      publishedAt: new Date(),
      dryRun: true,
    }
  }

  const response = await fetch(`https://graph.facebook.com/${config.graphVersion}/${config.pageId}/feed`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message: post.content,
      access_token: config.pageAccessToken,
    }),
  })

  if (!response.ok) {
    const payload = await response.text()
    throw new Error(`Meta publish failed: ${response.status} ${payload}`)
  }

  const data = (await response.json()) as { id?: string }

  return {
    platform: "meta",
    platformPostId: data.id ?? buildPlatformPostId(post),
    publishedAt: new Date(),
    dryRun: false,
  }
}

export async function publishMarketingPostToMeta(post: MarketingPost) {
  const result = await publishToMetaApi(post)

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
