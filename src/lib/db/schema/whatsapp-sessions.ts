import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core"

import { leads } from "./leads"

export type WhatsAppMessage = {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  whatsappNumber: text("whatsapp_number").notNull(),
  leadId: uuid("lead_id").references(() => leads.id),
  messages: jsonb("messages").$type<WhatsAppMessage[]>().notNull().default([]),
  status: text("status").notNull().default("active"), // active | escalated | closed
  escalationReason: text("escalation_reason"),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
