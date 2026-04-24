CREATE TABLE IF NOT EXISTS "whatsapp_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "whatsapp_number" text NOT NULL,
  "lead_id" uuid REFERENCES "leads"("id"),
  "messages" jsonb NOT NULL DEFAULT '[]',
  "status" text NOT NULL DEFAULT 'active',
  "escalation_reason" text,
  "last_message_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "whatsapp_sessions_number_idx" ON "whatsapp_sessions"("whatsapp_number");
CREATE INDEX IF NOT EXISTS "whatsapp_sessions_lead_idx" ON "whatsapp_sessions"("lead_id");
