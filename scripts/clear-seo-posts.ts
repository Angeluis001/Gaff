import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { seoPosts } from "../src/lib/db/schema/index"

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)
  const deleted = await db.delete(seoPosts).returning({ id: seoPosts.id, kind: seoPosts.kind, title: seoPosts.title })
  console.log(`Deleted ${deleted.length} SEO posts:`)
  deleted.forEach(p => console.log(` - [${p.kind}] ${p.title}`))
}
main()
