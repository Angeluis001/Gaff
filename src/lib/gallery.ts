import { asc, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { galleryItems } from "@/lib/db/schema"

export type PublicGalleryItem = {
  id: string
  title: string
  slug: string
  mediaType: "image" | "video"
  mediaRef: string
  posterRef: string | null
  caption: string | null
  altText: string | null
  tags: string[]
  boatCategory: string | null
  species: string | null
  featured: boolean
  sortOrder: number
}

export async function getPublishedGalleryItems(): Promise<PublicGalleryItem[]> {
  const rows = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.published, true))
    .orderBy(desc(galleryItems.featured), asc(galleryItems.sortOrder), desc(galleryItems.createdAt))

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    mediaType: row.mediaType,
    mediaRef: row.mediaRef,
    posterRef: row.posterRef ?? null,
    caption: row.caption ?? null,
    altText: row.altText ?? null,
    tags: row.tags ?? [],
    boatCategory: row.boatCategory ?? null,
    species: row.species ?? null,
    featured: row.featured,
    sortOrder: row.sortOrder,
  }))
}
