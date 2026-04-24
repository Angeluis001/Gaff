import { NextResponse } from "next/server"

import { runWebChatAgent, type WebChatMessage } from "@/lib/agents/chat-agent"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      history?: WebChatMessage[]
      message?: string
    }

    const message = typeof body.message === "string" ? body.message.trim() : ""
    const history = Array.isArray(body.history) ? body.history : []

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 })
    }

    const result = await runWebChatAgent(history, message)

    return NextResponse.json({ reply: result.reply, handoffUrl: result.handoffUrl ?? null })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Chat error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
