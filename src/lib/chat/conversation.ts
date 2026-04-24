import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { whatsappSessions } from "@/lib/db/schema"
import type { WhatsAppMessage } from "@/lib/db/schema/whatsapp-sessions"

export async function getOrCreateSession(whatsappNumber: string, leadId: string | null) {
  const [existing] = await db
    .select()
    .from(whatsappSessions)
    .where(
      and(
        eq(whatsappSessions.whatsappNumber, whatsappNumber),
        eq(whatsappSessions.status, "active")
      )
    )
    .limit(1)

  if (existing) return existing

  const [session] = await db
    .insert(whatsappSessions)
    .values({ whatsappNumber, leadId, messages: [], status: "active" })
    .returning()

  return session
}

export async function appendMessage(sessionId: string, message: WhatsAppMessage) {
  const [session] = await db
    .select()
    .from(whatsappSessions)
    .where(eq(whatsappSessions.id, sessionId))
    .limit(1)

  if (!session) return

  await db
    .update(whatsappSessions)
    .set({
      messages: [...(session.messages ?? []), message],
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(whatsappSessions.id, sessionId))
}

export async function updateSessionStatus(
  sessionId: string,
  status: "active" | "escalated" | "closed",
  escalationReason?: string
) {
  await db
    .update(whatsappSessions)
    .set({ status, escalationReason: escalationReason ?? null, updatedAt: new Date() })
    .where(eq(whatsappSessions.id, sessionId))
}
