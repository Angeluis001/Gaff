import { createHash } from "crypto"
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

import { getAdminAuthSecret } from "@/lib/auth/secret"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

function signCloudinary(params: Record<string, string | number>, apiSecret: string) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&")
  return createHash("sha256")
    .update(sorted + apiSecret)
    .digest("hex")
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey = process.env.CLOUDINARY_API_KEY
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = "gaff/fleet"

  const signature = signCloudinary({ folder, timestamp }, apiSecret)

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder })
}
