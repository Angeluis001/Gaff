import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { reviews } from "../src/lib/db/schema/index"

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)

  const rows = await db.insert(reviews).values([
    {
      platform: "google",
      platformReviewId: "seed-review-5star-001",
      authorName: "Mike Thompson",
      rating: 5,
      content: "Absolutely incredible experience! Captain was knowledgeable, the boat was pristine, and we caught 3 yellowfin tuna. Best fishing charter in Cabo by far. Will definitely book again next year!",
      responseStatus: "pending",
      reviewDate: new Date("2026-04-18"),
    },
    {
      platform: "tripadvisor",
      platformReviewId: "seed-review-2star-001",
      authorName: "Jennifer Walsh",
      rating: 2,
      content: "Disappointed with our trip. The boat left 45 minutes late with no explanation. Crew was not very communicative and we only caught small fish. Expected more for the price we paid.",
      responseStatus: "pending",
      reviewDate: new Date("2026-04-19"),
    },
  ]).returning({ id: reviews.id, platform: reviews.platform, rating: reviews.rating, authorName: reviews.authorName })

  console.log(JSON.stringify(rows, null, 2))
}
main()
