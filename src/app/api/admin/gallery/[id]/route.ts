import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { db } from "@/lib/db"
import { galleryItems } from "@/lib/db/schema"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

type Payload = {
  title?: string
  slug?: string
  mediaType?: "image" | "video"
  mediaRef?: string
  posterRef?: string | null
  caption?: string | null
  altText?: string | null
  tags?: string[]
  boatCategory?: string | null
  species?: string | null
  sortOrder?: number
  featured?: boolean
  published?: boolean
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = (await request.json()) as Payload

  if (body.mediaType && body.mediaType !== "image" && body.mediaType !== "video") {
    return NextResponse.json({ error: "Media type must be image or video" }, { status: 400 })
  }

  const payload = {
    ...(body.title !== undefined ? { title: body.title.trim() } : {}),
    ...(body.slug !== undefined ? { slug: body.slug.trim() } : {}),
    ...(body.mediaType !== undefined ? { mediaType: body.mediaType } : {}),
    ...(body.mediaRef !== undefined ? { mediaRef: body.mediaRef.trim() } : {}),
    ...(body.posterRef !== undefined ? { posterRef: body.posterRef?.trim() || null } : {}),
    ...(body.caption !== undefined ? { caption: body.caption?.trim() || null } : {}),
    ...(body.altText !== undefined ? { altText: body.altText?.trim() || null } : {}),
    ...(body.tags !== undefined ? { tags: body.tags.filter(Boolean) } : {}),
    ...(body.boatCategory !== undefined
      ? { boatCategory: body.boatCategory?.trim() || null }
      : {}),
    ...(body.species !== undefined ? { species: body.species?.trim() || null } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    ...(body.featured !== undefined ? { featured: body.featured } : {}),
    ...(body.published !== undefined ? { published: body.published } : {}),
    updatedAt: new Date(),
  }

  try {
    const [updated] = await db
      .update(galleryItems)
      .set(payload)
      .where(eq(galleryItems.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 })
    }

    revalidatePath("/")
    revalidatePath("/gallery")

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [deleted] = await db.delete(galleryItems).where(eq(galleryItems.id, id)).returning()

  if (!deleted) {
    return NextResponse.json({ error: "Gallery item not found" }, { status: 404 })
  }

  revalidatePath("/")
  revalidatePath("/gallery")

  return NextResponse.json({ success: true })
}
