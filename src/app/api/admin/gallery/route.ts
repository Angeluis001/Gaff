import { revalidatePath } from "next/cache"
import { asc } from "drizzle-orm"
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
  title: string
  slug: string
  mediaType: "image" | "video"
  mediaRef: string
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

function validatePayload(body: Partial<Payload>) {
  if (!body.title?.trim() || !body.slug?.trim() || !body.mediaRef?.trim()) {
    return "Missing required fields"
  }
  if (body.mediaType !== "image" && body.mediaType !== "video") {
    return "Media type must be image or video"
  }
  return null
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db.select().from(galleryItems).orderBy(asc(galleryItems.sortOrder), asc(galleryItems.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as Payload
  const validationError = validatePayload(body)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    const [item] = await db
      .insert(galleryItems)
      .values({
        title: body.title.trim(),
        slug: body.slug.trim(),
        mediaType: body.mediaType,
        mediaRef: body.mediaRef.trim(),
        posterRef: body.posterRef?.trim() || null,
        caption: body.caption?.trim() || null,
        altText: body.altText?.trim() || body.title.trim(),
        tags: body.tags?.filter(Boolean) ?? [],
        boatCategory: body.boatCategory?.trim() || null,
        species: body.species?.trim() || null,
        sortOrder: body.sortOrder ?? 0,
        featured: body.featured ?? false,
        published: body.published ?? false,
      })
      .returning()

    revalidatePath("/")
    revalidatePath("/gallery")

    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 })
  }
}
