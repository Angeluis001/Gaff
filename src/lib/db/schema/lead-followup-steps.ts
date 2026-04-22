import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core"
import { leads } from "./leads"

export const leadFollowupSteps = pgTable("lead_followup_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").notNull().references(() => leads.id),
  classification: text("classification").notNull(),
  channel: text("channel").notNull(), // email | whatsapp
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  stepIndex: integer("step_index").notNull(),
  dueAt: timestamp("due_at").notNull(),
  sentAt: timestamp("sent_at"), // null = pending
  createdAt: timestamp("created_at").defaultNow(),
})
