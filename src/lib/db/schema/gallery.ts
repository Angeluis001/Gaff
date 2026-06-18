import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const galleryItems = pgTable("gallery_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  mediaType: text("media_type").$type<"image" | "video">().notNull(),
  mediaRef: text("media_ref").notNull(),
  posterRef: text("poster_ref"),
  caption: text("caption"),
  altText: text("alt_text"),
  tags: jsonb("tags").$type<string[]>(),
  boatCategory: text("boat_category"),
  species: text("species"),
  sortOrder: integer("sort_order").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})
