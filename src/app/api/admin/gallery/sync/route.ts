import { revalidatePath } from "next/cache"
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { db } from "@/lib/db"
import { galleryItems } from "@/lib/db/schema"

const SYNC_FOLDER = "GAFF 1"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

function slugFromPublicId(publicId: string) {
  return publicId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function titleFromPublicId(publicId: string) {
  const filename = (publicId.split("/").pop() ?? publicId).replace(/\.[^.]+$/, "")
  return filename
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

type CloudinaryResource = {
  public_id: string
  secure_url: string
  resource_type: "image" | "video"
}

type SearchResponse = {
  resources: CloudinaryResource[]
  next_cursor?: string
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 })
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")
  const all: CloudinaryResource[] = []
  let nextCursor: string | undefined

  // Paginate through all assets — try asset_folder first (DAM), fall back to folder
  do {
    const body: Record<string, unknown> = {
      expression: `asset_folder="${SYNC_FOLDER}" OR folder="${SYNC_FOLDER}"`,
      max_results: 100,
      sort_by: [{ uploaded_at: "desc" }],
    }
    if (nextCursor) body.next_cursor = nextCursor

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const msg = await res.text()
      return NextResponse.json({ error: `Cloudinary error: ${msg}` }, { status: 500 })
    }

    const data = (await res.json()) as SearchResponse
    all.push(...data.resources)
    nextCursor = data.next_cursor
  } while (nextCursor)

  let inserted = 0
  let skipped = 0

  for (const resource of all) {
    if (resource.resource_type !== "image" && resource.resource_type !== "video") {
      skipped++
      continue
    }

    const mediaType = resource.resource_type
    const slug = slugFromPublicId(resource.public_id)
    const title = titleFromPublicId(resource.public_id)

    const result = await db
      .insert(galleryItems)
      .values({
        title,
        slug,
        mediaType,
        mediaRef: resource.secure_url,
        altText: title,
        tags: [],
        sortOrder: 0,
        featured: false,
        published: true,
      })
      .onConflictDoNothing()
      .returning({ id: galleryItems.id })

    if (result.length > 0) inserted++
    else skipped++
  }

  revalidatePath("/gallery")

  return NextResponse.json({ total: all.length, inserted, skipped })
}
