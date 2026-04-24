import { neon } from "@neondatabase/serverless"

const DB_URL = "postgresql://neondb_owner:npg_Ja2cKxq6NkvT@ep-spring-term-amprqmr6-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const sql = neon(DB_URL)

const statements = [
  // 0003 — whatsapp_sessions
  `CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    whatsapp_number text NOT NULL,
    lead_id uuid REFERENCES leads(id),
    messages jsonb NOT NULL DEFAULT '[]',
    status text NOT NULL DEFAULT 'active',
    escalation_reason text,
    last_message_at timestamp NOT NULL DEFAULT now(),
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS whatsapp_sessions_number_idx ON whatsapp_sessions(whatsapp_number)`,
  `CREATE INDEX IF NOT EXISTS whatsapp_sessions_lead_idx ON whatsapp_sessions(lead_id)`,
  // 0004 — review_request_sent_at
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS review_request_sent_at timestamp`,
]

for (const stmt of statements) {
  try {
    await sql.query(stmt)
    console.log(`✅ ${stmt.trim().slice(0, 60)}...`)
  } catch (e) {
    console.error(`❌ ${e.message}\n   → ${stmt.trim().slice(0, 80)}`)
    process.exit(1)
  }
}

console.log("\nAll migrations applied successfully.")
