import { eq, and } from "drizzle-orm"

import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"

import type { ReviewSnapshot } from "./polling"

type SyncedReview = {
  id: string
  platform: string
  rating: number | null
  responseStatus: string | null
  responseContent: string | null
}

function buildDraftResponse(snapshot: ReviewSnapshot) {
  if (!snapshot.rating) {
    return null
  }

  if (snapshot.rating <= 3) {
    return `Thank you for the honest feedback, ${snapshot.authorName ?? "guest"}. We are sorry the trip missed the mark and we would like to make it right.`
  }

  return `Thank you for fishing with GAFF, ${snapshot.authorName ?? "guest"}. We appreciate the kind words and hope to see you back in Cabo soon.`
}

async function fetchOpenAIDraft(snapshot: ReviewSnapshot) {
  if (!process.env.OPENAI_API_KEY) {
    return buildDraftResponse(snapshot)
  }

  const model = process.env.OPENAI_REVIEW_MODEL?.trim() || "gpt-4o"
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Write a short, professional review response for a fishing charter company. Be warm, specific, and concise.",
        },
        {
          role: "user",
          content: JSON.stringify(snapshot),
        },
      ],
    }),
  })

  if (!response.ok) {
    return buildDraftResponse(snapshot)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>
  }

  return data.choices?.[0]?.message?.content?.trim() || buildDraftResponse(snapshot)
}

async function findExistingReview(snapshot: ReviewSnapshot) {
  if (snapshot.platformReviewId) {
    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(eq(reviews.platform, snapshot.platform), eq(reviews.platformReviewId, snapshot.platformReviewId))
      )
      .limit(1)

    return review ?? null
  }

  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.platform, snapshot.platform))
    .limit(1)

  return review ?? null
}

export async function syncReviewSnapshot(snapshot: ReviewSnapshot): Promise<SyncedReview> {
  const existingReview = await findExistingReview(snapshot)
  const responseContent = await fetchOpenAIDraft(snapshot)
  const reviewDate = snapshot.reviewDate ?? new Date()

  const payload = {
    platform: snapshot.platform,
    platformReviewId: snapshot.platformReviewId,
    authorName: snapshot.authorName,
    rating: snapshot.rating,
    content: snapshot.content,
    responseContent,
    responseStatus: snapshot.rating !== null && snapshot.rating <= 3 ? "pending" : "draft",
    bookingId: snapshot.bookingId,
    reviewDate,
    createdAt: new Date(),
  } satisfies typeof reviews.$inferInsert

  const savedReview = existingReview
    ? (
        await db
          .update(reviews)
          .set({
            ...payload,
            createdAt: existingReview.createdAt ?? payload.createdAt,
          })
          .where(eq(reviews.id, existingReview.id))
          .returning()
      )[0]
    : (
        await db
          .insert(reviews)
          .values(payload)
          .returning()
      )[0]

  return {
    id: savedReview.id,
    platform: savedReview.platform,
    rating: savedReview.rating,
    responseStatus: savedReview.responseStatus,
    responseContent: savedReview.responseContent,
  }
}
