import { db } from "@/lib/db"
import { marketingPosts, seoPosts } from "@/lib/db/schema"

type MarketingPost = typeof marketingPosts.$inferSelect

const MARKETING_MODEL = "gpt-4o-mini"

const SOCIAL_SYSTEM_PROMPT = `You write social media captions for GAFF All Fishing Los Cabos — a premium sport fishing charter company in Cabo San Lucas, México targeting US tourists.

SOCIAL CONTENT FRAMEWORK:
Content pillars (vary by post):
1. Trip results: hook on the catch ("A family from Texas just landed a 280lb blue marlin off Cabo...")
2. Educational: season/species tip ("October in Cabo = marlin peak. Here's what to know before you book")
3. Behind-the-scenes: captain or crew story ("Captain Marco has fished these waters for 18 years...")
4. Booking CTA: scarcity + urgency ("2 full-day slots left in October — marlin season closes Nov 30")
5. Social proof: testimonial hook ("500+ anglers gave GAFF a 4.8★ on TripAdvisor. Here's why")

HOOK RULES (3-second hook — first line must work alone):
- Curiosity: "You won't believe what they caught off Cabo this week..."
- Story: "A [group type] came to Cabo for [occasion]. They left with [result]."
- Value: "How to [achieve desired outcome] (without [common fear])"

PLATFORM GUIDELINES:
- instagram: 150-220 chars body + 5-8 hashtags on new line. Hook on line 1. Warm, visual, story-driven.
- facebook: 100-180 chars body + 2-3 hashtags inline. Conversational, booking-focused.
- tiktok: 80-120 chars body + 3-5 trending hashtags. Ultra-short hook. Energy-forward.

COMPETITOR CONTEXT: Our main competitor is piscessportfishing.com (larger, impersonal fleet). GAFF's edge: personalized service, IGFA captains, online booking, 4.8★ TripAdvisor.

GUARDRAILS:
- Never mention prices in captions (DM/website for pricing)
- Never use "fishing trip" — use "fishing charter" or "offshore adventure"
- Always end with a CTA: "Link in bio to book" (Instagram) or "Book at gaffallfishingloscabos.com" (Facebook)
- Return ONLY the caption text — no explanation, no labels`

async function generateSocialCaption(
  platform: string,
  postContext: { title?: string; kind?: string; content?: string; keyword?: string }
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MARKETING_MODEL,
        temperature: 0.8,
        max_tokens: 300,
        messages: [
          { role: "system", content: SOCIAL_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Platform: ${platform}\nPost type: ${postContext.kind ?? "general"}\nTopic: ${postContext.title ?? postContext.keyword ?? "Cabo fishing"}\nContext: ${postContext.content?.slice(0, 200) ?? ""}\n\nWrite the caption.`,
          },
        ],
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string | null } }> }
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch {
    return null
  }
}

const STATIC_REPLY_DRAFT =
  "Thanks for the support! Ask us about current Cabo conditions, boat options, or the next available charter window — link in bio to book."

async function generateCommentReplyDraft(post: MarketingPost): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return STATIC_REPLY_DRAFT
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MARKETING_MODEL,
        temperature: 0.6,
        max_tokens: 120,
        messages: [
          {
            role: "user",
            content: `Write a 1-2 sentence reply to a comment on a GAFF All Fishing Instagram post. Be warm, specific to fishing, and end with a CTA to check availability. Post topic: "${post.content?.slice(0, 100) ?? "Cabo fishing charter"}". Return only the reply text.`,
          },
        ],
      }),
    })
    if (!res.ok) return STATIC_REPLY_DRAFT
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string | null } }> }
    return data.choices?.[0]?.message?.content?.trim() ?? STATIC_REPLY_DRAFT
  } catch {
    return STATIC_REPLY_DRAFT
  }
}

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

  const replyDrafts = await Promise.all(
    marketingRows
      .filter((post) => post.status === "published")
      .slice(0, 5)
      .map(async (post) => ({
        postId: post.id,
        platform: post.platform,
        draft: await generateCommentReplyDraft(post),
      }))
  )

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

export async function generateMarketingCalendarCaptions(): Promise<
  Array<{ postId: string; platform: string; generatedCaption: string | null }>
> {
  const rows = await db.select().from(marketingPosts)
  const draftPosts = rows.filter((post) => (post.status ?? "draft") === "draft").slice(0, 10)

  return Promise.all(
    draftPosts.map(async (post) => ({
      postId: post.id,
      platform: post.platform,
      generatedCaption: await generateSocialCaption(post.platform, {
        title: post.content?.slice(0, 80),
        kind: "marketing_post",
        content: post.content ?? undefined,
      }),
    }))
  )
}
