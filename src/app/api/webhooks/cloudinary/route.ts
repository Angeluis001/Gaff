import { createHash } from "crypto"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { galleryItems } from "@/lib/db/schema"

// Folder name exactly as shown in Cloudinary Media Library
const SYNC_FOLDER = "GAFF 1"

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

function verifySignature(rawBody: string, timestamp: string, signature: string, apiSecret: string) {
  const expected = createHash("sha1")
    .update(rawBody + timestamp + apiSecret)
    .digest("hex")
  return expected === signature
}

type CloudinaryNotification = {
  notification_type?: string
  public_id?: string
  secure_url?: string
  resource_type?: string
  folder?: string
  asset_folder?: string
}

export async function POST(request: Request) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!apiSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 })
  }

  const rawBody = await request.text()
  const timestamp = request.headers.get("x-cld-timestamp") ?? ""
  const signature = request.headers.get("x-cld-signature") ?? ""

  if (timestamp && signature) {
    const ts = parseInt(timestamp, 10)
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - ts) > 300) {
      return NextResponse.json({ error: "Stale request" }, { status: 401 })
    }
    if (!verifySignature(rawBody, timestamp, signature, apiSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
  }

  let payload: CloudinaryNotification
  try {
    payload = JSON.parse(rawBody) as CloudinaryNotification
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Only handle upload events
  if (payload.notification_type && payload.notification_type !== "upload") {
    return NextResponse.json({ ok: true, skipped: "not an upload event" })
  }

  // Check it belongs to our target folder
  const folder = payload.asset_folder ?? payload.folder ?? ""
  if (!folder.includes(SYNC_FOLDER)) {
    return NextResponse.json({ ok: true, skipped: `folder "${folder}" not synced` })
  }

  const resourceType = payload.resource_type ?? "image"
  if (resourceType !== "image" && resourceType !== "video") {
    return NextResponse.json({ ok: true, skipped: "unsupported resource type" })
  }

  const publicId = payload.public_id
  const secureUrl = payload.secure_url

  if (!publicId || !secureUrl) {
    return NextResponse.json({ error: "Missing public_id or secure_url" }, { status: 400 })
  }

  const mediaType = resourceType === "video" ? "video" : "image"
  const slug = slugFromPublicId(publicId)
  const title = titleFromPublicId(publicId)

  try {
    await db
      .insert(galleryItems)
      .values({
        title,
        slug,
        mediaType,
        mediaRef: secureUrl,
        altText: title,
        tags: [],
        sortOrder: 0,
        featured: false,
        published: true,
      })
      .onConflictDoNothing()

    return NextResponse.json({ ok: true, inserted: slug })
  } catch (err) {
    console.error("Gallery webhook DB error:", err)
    return NextResponse.json({ error: "DB error" }, { status: 500 })
  }
}
