import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { bookings } from "../src/lib/db/schema/index"
import { eq } from "drizzle-orm"

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)

  // Find the first non-completed booking to mark as completed
  const all = await db.select({
    id: bookings.id,
    status: bookings.status,
    tripType: bookings.tripType,
    date: bookings.date,
  }).from(bookings).limit(10)

  console.log("Existing bookings:", JSON.stringify(all, null, 2))

  if (all.length === 0) {
    console.log("No bookings found")
    return
  }

  const target = all.find(b => b.status !== "completed") ?? all[0]
  console.log(`\nMarking booking ${target.id} as completed...`)

  const [updated] = await db.update(bookings)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(bookings.id, target.id))
    .returning({ id: bookings.id, status: bookings.status, tripType: bookings.tripType })

  console.log("Updated:", JSON.stringify(updated, null, 2))
}
main()
