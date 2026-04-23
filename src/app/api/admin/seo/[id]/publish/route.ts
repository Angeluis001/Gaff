import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { db } from "@/lib/db"
import { seoPosts } from "@/lib/db/schema"

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
    .update(seoPosts)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(seoPosts.id, id))
    .returning({ id: seoPosts.id, status: seoPosts.status })

  if (!updated) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 })
  }

  return NextResponse.json({ ok: true, status: updated.status })
}
