import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { id } = await params

  const [updated] = await db
    .update(reviews)
    .set({ responseStatus: "approved" })
    .where(eq(reviews.id, id))
    .returning({ id: reviews.id, responseStatus: reviews.responseStatus })

  if (!updated) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 })
  }

  return NextResponse.json({ ok: true, responseStatus: updated.responseStatus })
}
