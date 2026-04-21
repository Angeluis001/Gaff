import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { getAdminAuthSecret } from "@/lib/auth/secret"
import { db } from "@/lib/db"
import { bookings, boats, leads } from "@/lib/db/schema"
import { syncClientFromCompletedBooking } from "@/lib/crm/clients"
import { scheduleClientLifecycleCampaigns } from "@/lib/crm/campaigns"
import { sendTransactionalEmail } from "@/lib/resend"
import { PostTripReviewRequestEmail } from "@/emails/PostTripReviewRequestEmail"

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

  try {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 })
    }

    const shouldSendReviewEmail = booking.status !== "completed" || !booking.clientId

    if (booking.status !== "completed") {
      await db
        .update(bookings)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(bookings.id, id))
    }

    const syncResult = await syncClientFromCompletedBooking(id)
    const campaignSchedules = await scheduleClientLifecycleCampaigns(syncResult.clientId)

    const [completedBooking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1)
    const [boat] = await db.select().from(boats).where(eq(boats.id, completedBooking?.boatId ?? "")).limit(1)

    if (shouldSendReviewEmail && completedBooking?.leadId) {
      const leadRows = await db.select().from(leads)
      const lead = leadRows.find((entry) => entry.id === completedBooking.leadId)

      if (lead?.email) {
        await sendTransactionalEmail({
          to: lead.email,
          subject: `Tell us about your trip on ${completedBooking.date.toISOString().slice(0, 10)}`,
          react: PostTripReviewRequestEmail({
            customerName: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
            boatName: boat?.name ?? "your GAFF boat",
            tripDate: completedBooking.date.toISOString().slice(0, 10),
          }),
        })
      }
    }

    return NextResponse.json({
      completed: true,
      bookingId: id,
      clientId: syncResult.clientId,
      createdClient: syncResult.created,
      campaignCount: campaignSchedules.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete booking."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 })
}
