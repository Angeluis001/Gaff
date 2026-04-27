import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { db } from "@/lib/db"
import { boatAvailability } from "@/lib/db/schema"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const rows = await db
    .select()
    .from(boatAvailability)
    .where(and(eq(boatAvailability.boatId, id), eq(boatAvailability.reason, "maintenance")))
    .orderBy(boatAvailability.date)

  return NextResponse.json(rows)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = (await request.json()) as { dates: string[]; reason?: string }

  if (!body.dates?.length) {
    return NextResponse.json({ error: "dates array required" }, { status: 400 })
  }

  const rows = await db
    .insert(boatAvailability)
    .values(
      body.dates.map((date) => ({
        boatId: id,
        date: new Date(date),
        isAvailable: false,
        reason: body.reason ?? "maintenance",
      }))
    )
    .onConflictDoNothing()
    .returning()

  return NextResponse.json(rows, { status: 201 })
}
