import { NextResponse } from "next/server"

import { getChatKnowledgeExport } from "@/lib/chat/knowledge"

export function GET() {
  return NextResponse.json(getChatKnowledgeExport(), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
