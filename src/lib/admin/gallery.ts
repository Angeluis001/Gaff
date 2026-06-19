import { asc } from "drizzle-orm"

import { db } from "@/lib/db"
import { galleryItems } from "@/lib/db/schema"

export async function getAdminGalleryItems() {
  return db
    .select()
    .from(galleryItems)
    .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.createdAt))
}
