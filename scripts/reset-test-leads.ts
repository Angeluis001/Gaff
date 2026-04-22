import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { leads } from "../src/lib/db/schema/index"
import { inArray } from "drizzle-orm"

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)
  const ids = [
    "535e974a-b47f-495a-ab54-6e5cfaddd539",
    "32a15b76-fda2-441e-b714-4769af3f395b",
    "76574bf0-d854-495d-9ddd-d7c2ee632a0e",
  ]
  const rows = await db
    .update(leads)
    .set({ classification: null, status: "new", updatedAt: new Date() })
    .where(inArray(leads.id, ids))
    .returning({ id: leads.id, firstName: leads.firstName, notes: leads.notes, groupSize: leads.groupSize })
  console.log(JSON.stringify(rows, null, 2))
}
main()
