import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { reviews } from "../src/lib/db/schema/index"
import { eq, isNull } from "drizzle-orm"

async function fetchGptResponse(review: { authorName: string | null; rating: number | null; content: string | null; platform: string }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "Write a short, professional review response for GAFF All Fishing, a premium sport fishing charter in Cabo San Lucas. Be warm, specific, and concise. Max 3 sentences.",
        },
        {
          role: "user",
          content: JSON.stringify(review),
        },
      ],
    }),
  })
  const data = await res.json() as { choices?: Array<{ message?: { content?: string | null } }> }
  return data.choices?.[0]?.message?.content?.trim() ?? null
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)

  const pending = await db.select().from(reviews).where(isNull(reviews.responseContent))

  console.log(`Found ${pending.length} reviews without responses`)

  for (const review of pending) {
    const draft = await fetchGptResponse({
      authorName: review.authorName,
      rating: review.rating,
      content: review.content,
      platform: review.platform,
    })

    await db.update(reviews)
      .set({ responseContent: draft, responseStatus: (review.rating ?? 5) <= 3 ? "pending" : "draft" })
      .where(eq(reviews.id, review.id))

    console.log(`\n[${review.platform}] ${review.authorName} (${review.rating}★)`)
    console.log(`Draft: ${draft}`)
  }
}
main()
