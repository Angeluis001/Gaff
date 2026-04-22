CREATE TABLE IF NOT EXISTS "lead_followup_steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL REFERENCES "leads"("id"),
  "classification" text NOT NULL,
  "channel" text NOT NULL,
  "subject" text NOT NULL,
  "message" text NOT NULL,
  "step_index" integer NOT NULL,
  "due_at" timestamp NOT NULL,
  "sent_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "reminder_sent_at" timestamp;
