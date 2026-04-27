import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { db } from "@/lib/db"
import { boatAvailability } from "@/lib/db/schema"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; availId: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { availId } = await params
  const numericId = parseInt(availId, 10)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const [deleted] = await db
    .delete(boatAvailability)
    .where(eq(boatAvailability.id, numericId))
    .returning()

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
