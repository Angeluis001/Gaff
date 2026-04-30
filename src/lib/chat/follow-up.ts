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
      subject: "Your Cabo marlin window is closing — let's lock it in",
      message:
        "Your group's trip details are ready and I want to make sure you don't lose your date.\n\nOctober is peak marlin season in Cabo — boats fill fast and our best availability goes first. GAFF has a 4.8★ rating from 500+ anglers who've stood where you're planning to stand.\n\nReply to this email or click below to confirm your booking today. I'll hold the best boat for your group for 24 hours.",
    },
    {
      channel: "whatsapp",
      delayMinutes: 240,
      subject: "Checking in — your Cabo trip",
      message:
        "Hey {{firstName}} 👋 Following up on your GAFF charter request.\n\nWe still have your preferred date open, but spots fill fast this season. I can confirm the best boat for your group right now — just reply here and I'll send you the booking link directly.",
    },
  ],
  warm: [
    {
      channel: "email",
      delayMinutes: 24 * 60,
      subject: "Still planning your Cabo trip? Here's what to know",
      message:
        "Planning a Cabo fishing trip takes more thought than most — you want the right boat, the right season, the right captain.\n\nHere's what matters for your dates: {{seasonNote}}. GAFF's IGFA-certified captains know these waters and will position you where the fish are running.\n\nWhen you're ready, I can match your group to the right charter in 2 minutes. Just reply with your group size and preferred dates.",
    },
    {
      channel: "whatsapp",
      delayMinutes: 72 * 60,
      subject: "Quick question about your trip",
      message:
        "Hi {{firstName}} — any questions about the charter before you decide?\n\nHappy to compare boat options or match your group to the best date window. Takes 2 minutes and there's no commitment. Just reply here.",
    },
  ],
  cold: [
    {
      channel: "email",
      delayMinutes: 48 * 60,
      subject: "Still planning that Cabo fishing trip?",
      message:
        "No rush — but when you're ready to nail down dates, we can help you avoid the most common mistake: booking the wrong season for your target species.\n\nBlue marlin peaks Oct-Nov. Yellowfin tuna runs May-Dec. Dorado is best Jun-Sep. Match your travel dates to the right bite window and you'll have a story to tell for years.\n\nReply anytime and I'll map out what's running when you're in Cabo.",
    },
    {
      channel: "email",
      delayMinutes: 7 * 24 * 60,
      subject: "Your marlin peak window: {{monthsUntilPeak}} months away",
      message:
        "Quick fishing intel for your Cabo trip planning:\n\n🎣 *This week offshore:* Yellowfin tuna and dorado are biting strong. Marlin season is approaching — October is the peak and it books out early.\n\nIf you're thinking October, now is when to lock in a date. Miss the window and you'll wait another year for the peak bite.\n\nReply and I'll check what's still available on your preferred dates.",
    },
    {
      channel: "whatsapp",
      delayMinutes: 14 * 24 * 60,
      subject: "Weekly Cabo fishing update",
      message:
        "🎣 *GAFF Cabo update:* Yellowfin tuna and dorado are biting strong offshore this week. Marlin season is approaching — October is the peak.\n\nIf you're still planning a Cabo trip, now is a great time to lock in a date before the best windows fill. Reply and I'll help you pick the right boat for your group.",
    },
    {
      channel: "whatsapp",
      delayMinutes: 21 * 24 * 60,
      subject: "Best season for your target species",
      message:
        "🌊 Did you know Cabo has world-class fishing nearly year-round?\n\nMarlin Jun-Nov (peak Oct) · Tuna May-Dec · Dorado Jun-Oct · Wahoo Jul-Nov\n\nTell me when you're visiting and I'll tell you what's running. Our 4.8★ captains will put you on the fish — that's the GAFF guarantee.",
    },
    {
      channel: "email",
      delayMinutes: 30 * 24 * 60,
      subject: "Last open dates before peak season — want first look?",
      message:
        "We have a few open dates left on the fleet before marlin season fills up completely.\n\nI'd rather give you first look than open them to new inquiries. If a Cabo fishing trip is still on your radar — even tentatively — reply to this email and I'll hold a date for 48 hours while you decide.\n\nNo deposit required to hold. Just your preferred dates and group size.",
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
