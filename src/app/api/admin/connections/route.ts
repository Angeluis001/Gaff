import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { getConnectionGraph, searchConnectionEntities } from "@/lib/admin/connections"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as never, secret: getAdminAuthSecret() })
  return Boolean(token?.id && token.isActive)
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as "lead" | "client" | "booking" | null
  const id = searchParams.get("id")
  const q = searchParams.get("q")

  // Search mode: GET /api/admin/connections?q=john
  if (q) {
    const results = await searchConnectionEntities(q.trim())
    return NextResponse.json(results)
  }

  // Graph mode: GET /api/admin/connections?type=lead&id=xxx
  if (!type || !id || !["lead", "client", "booking"].includes(type)) {
    return NextResponse.json({ error: "type and id are required" }, { status: 400 })
  }

  const graph = await getConnectionGraph(type, id)
  if (!graph) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(graph)
}
