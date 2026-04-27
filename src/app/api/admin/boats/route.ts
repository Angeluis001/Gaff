import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { db } from "@/lib/db"
import { boats } from "@/lib/db/schema"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db.select().from(boats).orderBy(boats.name)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as {
    name: string
    slug: string
    category: "standard" | "midsize" | "large" | "luxury"
    capacity: number
    length?: string
    description?: string
    features?: string[]
    priceHalfDay?: string
    priceFullDay?: string
    captainName?: string
    isActive?: boolean
  }

  if (!body.name || !body.slug || !body.category || !body.capacity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const [boat] = await db
    .insert(boats)
    .values({
      name: body.name,
      slug: body.slug,
      category: body.category,
      capacity: body.capacity,
      length: body.length ?? null,
      description: body.description ?? null,
      features: body.features ?? null,
      images: [],
      priceHalfDay: body.priceHalfDay ?? null,
      priceFullDay: body.priceFullDay ?? null,
      captainName: body.captainName ?? null,
      isActive: body.isActive ?? true,
    })
    .returning()

  return NextResponse.json(boat, { status: 201 })
}
