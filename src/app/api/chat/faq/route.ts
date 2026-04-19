import { NextResponse } from "next/server"

import { getChatFaqExport } from "@/lib/chat/faq"

export function GET() {
  return NextResponse.json(getChatFaqExport())
}

