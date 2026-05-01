import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { sql } from "drizzle-orm"

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL is not set.")
    process.exit(1)
  }

  const db = drizzle(neon(databaseUrl))

  console.log("=== GAFF Phase 10 — DB Migration Verification ===\n")

  // Check whatsapp_sessions table exists
  const sessionsResult = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'whatsapp_sessions'
    ) as exists
  `)
  const sessionsExists = sessionsResult.rows[0]
  console.log("whatsapp_sessions table exists:", sessionsExists)

  // Check review_request_sent_at column exists on bookings
  const columnResult = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bookings'
        AND column_name = 'review_request_sent_at'
    ) as exists
  `)
  const columnExists = columnResult.rows[0]
  console.log("review_request_sent_at column exists:", columnExists)

  // Sanity check: count rows (should be 0 or more, not error)
  const sessionCount = await db.execute(sql`SELECT COUNT(*) as count FROM whatsapp_sessions`)
  console.log("whatsapp_sessions row count:", sessionCount.rows[0])

  // Summary
  console.log("\n=== Summary ===")
  const allOk =
    (sessionsExists as { exists: boolean }).exists === true &&
    (columnExists as { exists: boolean }).exists === true

  if (allOk) {
    console.log("PASS: Both migrations are applied. DB is ready for Phase 10.")
    // Let the process exit naturally to avoid libuv handle-closing assertion on Windows
  } else {
    console.error("FAIL: One or more migrations are missing.")
    if (!(sessionsExists as { exists: boolean }).exists) {
      console.error(
        "  - MISSING: whatsapp_sessions table (apply migration 0003_whatsapp_sessions.sql)"
      )
    }
    if (!(columnExists as { exists: boolean }).exists) {
      console.error(
        "  - MISSING: review_request_sent_at column on bookings (apply migration 0004_booking_review_request.sql)"
      )
    }
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
