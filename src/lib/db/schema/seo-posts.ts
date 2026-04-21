import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core"

import { bookings } from "./bookings"

export const seoPosts = pgTable("seo_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(), // blog_post, fishing_report
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  keywordFocus: text("keyword_focus"),
  competitorFocus: text("competitor_focus"),
  sourceBookingId: uuid("source_booking_id").references(() => bookings.id),
  status: text("status").default("draft"), // draft, scheduled, published, failed
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

