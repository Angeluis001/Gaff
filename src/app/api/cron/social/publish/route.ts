import { eq, inArray } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { marketingPosts } from "@/lib/db/schema"
import { publishMarketingPostToMeta } from "@/lib/social/meta"
import { publishMarketingPostToTikTok } from "@/lib/social/tiktok"

function isAuthorizedCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production"
  }

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()
  const headerToken = request.headers.get("x-cron-secret")?.trim()

  return bearerToken === cronSecret || headerToken === cronSecret
}

async function publishMarketingPost(post: typeof marketingPosts.$inferSelect) {
  if (post.platform === "tiktok") {
    return publishMarketingPostToTikTok(post)
  }

  if (post.platform === "instagram" || post.platform === "facebook") {
    return publishMarketingPostToMeta(post)
  }

  throw new Error(`Unsupported marketing platform: ${post.platform}`)
}

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const now = new Date()
    const publishablePosts = await db
      .select()
      .from(marketingPosts)
      .where(inArray(marketingPosts.status, ["scheduled", "draft", "failed"]))

    const duePosts = publishablePosts.filter((post) => {
      if (post.status === "scheduled") {
        return !post.scheduledAt || post.scheduledAt <= now
      }

      return Boolean(post.scheduledAt)
    })

    const processed: Array<Record<string, unknown>> = []

    for (const post of duePosts.slice(0, 10)) {
      try {
        const result = await publishMarketingPost(post)
        processed.push({
          postId: result.post.id,
          platform: post.platform,
          status: result.post.status,
          platformPostId: result.post.platformPostId,
          dryRun: result.result.dryRun,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Publishing failed."

        await db
          .update(marketingPosts)
          .set({
            status: "failed",
          })
          .where(eq(marketingPosts.id, post.id))

        processed.push({
          postId: post.id,
          platform: post.platform,
          status: "failed",
          error: message,
        })
      }
    }

    return NextResponse.json({
      received: true,
      processedCount: processed.length,
      processed,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to publish marketing queue."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return POST(request)
}
