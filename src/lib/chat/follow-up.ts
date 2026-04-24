import type { LeadClassification } from "./lead-types"
import { db } from "@/lib/db"
import { leadActivities, leadFollowupSteps } from "@/lib/db/schema"

type FollowUpChannel = "email" | "whatsapp"

export type FollowUpStep = {
  channel: FollowUpChannel
  delayMinutes: number
  subject: string
  message: string
}

export type FollowUpScheduleResult = {
  leadId: string
  classification: LeadClassification
  steps: Array<FollowUpStep & { dueAt: string }>
}

const FOLLOW_UP_SEQUENCE: Record<LeadClassification, FollowUpStep[]> = {
  hot: [
    {
      channel: "email",
      delayMinutes: 60,
      subject: "We saved your GAFF trip details",
      message:
        "Quick follow-up: we have your preferred trip details ready and can help lock in the best boat and date.",
    },
    {
      channel: "whatsapp",
      delayMinutes: 240,
      subject: "Checking in on your trip",
      message:
        "Just checking back on your Cabo charter request. If you want, we can confirm the best boat options right now.",
    },
  ],
  warm: [
    {
      channel: "email",
      delayMinutes: 24 * 60,
      subject: "Your GAFF trip options",
      message:
        "Here are the trip details we captured. Reply if you want us to narrow the best boat and date window.",
    },
    {
      channel: "whatsapp",
      delayMinutes: 72 * 60,
      subject: "Need help choosing the right trip?",
      message:
        "We can still help match your group to the right charter if you want a quick recommendation.",
    },
  ],
  cold: [
    {
      channel: "email",
      delayMinutes: 48 * 60,
      subject: "Plan your future Cabo fishing trip",
      message:
        "Whenever you're ready, we can help compare the boats and the best dates for your trip.",
    },
    {
      channel: "email",
      delayMinutes: 7 * 24 * 60,
      subject: "A better date for your GAFF charter",
      message:
        "If your timing changed, we can help you pick a better window for offshore fishing in Cabo.",
    },
    {
      channel: "whatsapp",
      delayMinutes: 14 * 24 * 60,
      subject: "Weekly fishing report",
      message:
        "🎣 *Cabo fishing update this week:* Yellowfin tuna and dorado are biting strong offshore. Marlin season is approaching — October is the peak. If you're planning a trip soon, now is a great time to lock in a date. Reply anytime and we'll help you pick the right boat.",
    },
    {
      channel: "whatsapp",
      delayMinutes: 21 * 24 * 60,
      subject: "Best season for your target species",
      message:
        "🌊 Did you know Cabo San Lucas has world-class fishing nearly year-round? Marlin peak Jun-Nov, Tuna May-Dec, Dorado Jun-Oct. We can match your travel dates to the best bite window. Want us to check what's running when you're here?",
    },
    {
      channel: "email",
      delayMinutes: 30 * 24 * 60,
      subject: "Last chance — limited availability in Cabo",
      message:
        "We still have a few open dates on our fleet. Availability fills fast in peak season and we wanted to give you the first look before we open it up. If you're still thinking about a Cabo trip, reply and we'll hold a date for you.",
    },
  ],
}

export async function scheduleLeadFollowUps(
  lead: { id: string },
  classification: LeadClassification
): Promise<FollowUpScheduleResult> {
  const steps = FOLLOW_UP_SEQUENCE[classification]
  const now = new Date()

  const persistedSteps = await Promise.all(
    steps.map(async (step, index) => {
      const dueAt = new Date(now.getTime() + step.delayMinutes * 60 * 1000)

      await db.insert(leadFollowupSteps).values({
        leadId: lead.id,
        classification,
        channel: step.channel,
        subject: step.subject,
        message: step.message,
        stepIndex: index + 1,
        dueAt,
      })

      await db.insert(leadActivities).values({
        leadId: lead.id,
        type: "note",
        description: `Scheduled ${step.channel} follow-up for ${classification} lead (step ${index + 1}, due ${dueAt.toISOString()}).`,
        metadata: { channel: step.channel, dueAt: dueAt.toISOString(), stepIndex: index + 1 },
        agentId: "lead-agent",
      })

      return { ...step, dueAt: dueAt.toISOString() }
    })
  )

  return { leadId: lead.id, classification, steps: persistedSteps }
}
