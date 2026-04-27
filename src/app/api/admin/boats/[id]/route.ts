import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { db } from "@/lib/db"
import { boats } from "@/lib/db/schema"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = (await request.json()) as {
    name?: string
    slug?: string
    category?: "standard" | "midsize" | "large" | "luxury"
    capacity?: number
    length?: string | null
    description?: string | null
    features?: string[] | null
    images?: string[]
    priceHalfDay?: string | null
    priceFullDay?: string | null
    captainName?: string | null
    isActive?: boolean
  }

  const [updated] = await db
    .update(boats)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(boats.id, id))
    .returning()

  if (!updated) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [deleted] = await db.delete(boats).where(eq(boats.id, id)).returning()

  if (!deleted) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
