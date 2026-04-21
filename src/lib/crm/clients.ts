import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { bookings, clients, leadActivities, leads } from "@/lib/db/schema"

import { formatDateTime } from "@/lib/admin/formatters"

export type CompletedBookingClientSyncResult = {
  clientId: string
  bookingId: string
  created: boolean
  totalTrips: number
}

function toNumber(value: string | number | null | undefined) {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function getPreferredSpecies(fishCaught: typeof bookings.$inferSelect["fishCaught"]) {
  const species = (fishCaught ?? []).map((entry) => entry.species).filter(Boolean)
  return Array.from(new Set(species))
}

export async function syncClientFromCompletedBooking(bookingId: string): Promise<CompletedBookingClientSyncResult> {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1)

  if (!booking) {
    throw new Error("Completed booking not found.")
  }

  if (booking.status !== "completed") {
    throw new Error("Booking must be completed before syncing a client.")
  }

  if (booking.clientId) {
    const [existingClient] = await db.select().from(clients).where(eq(clients.id, booking.clientId)).limit(1)

    if (existingClient) {
      return {
        clientId: existingClient.id,
        bookingId: booking.id,
        created: false,
        totalTrips: existingClient.totalTrips ?? 0,
      }
    }
  }

  const [lead] = booking.leadId
    ? await db.select().from(leads).where(eq(leads.id, booking.leadId)).limit(1)
    : []

  if (!lead?.email) {
    throw new Error("Completed booking must be linked to a lead with an email.")
  }

  const [existingClient] = await db
    .select()
    .from(clients)
    .where(eq(clients.email, lead.email))
    .limit(1)

  const nextTotalTrips = (existingClient?.totalTrips ?? 0) + 1
  const nextTotalSpend = toNumber(existingClient?.totalSpend) + toNumber(booking.totalPrice)
  const preferredSpecies = Array.from(
    new Set([...(existingClient?.preferredSpecies ?? []), ...getPreferredSpecies(booking.fishCaught)])
  )

  const payload = {
    firstName: lead.firstName,
    lastName: lead.lastName ?? existingClient?.lastName ?? "",
    email: lead.email,
    phone: lead.phone ?? existingClient?.phone ?? null,
    whatsappNumber: lead.whatsappNumber ?? existingClient?.whatsappNumber ?? null,
    preferredBoatCategory: lead.preferredBoatCategory ?? existingClient?.preferredBoatCategory ?? null,
    preferredSpecies,
    totalTrips: nextTotalTrips,
    totalSpend: nextTotalSpend.toFixed(2),
    lastTripDate: booking.date,
    communicationPreference: existingClient?.communicationPreference ?? "email",
    optInMarketing: existingClient?.optInMarketing ?? true,
    notes: [
      existingClient?.notes,
      `Completed booking ${booking.id} on ${formatDateTime(booking.date)}.`,
    ]
      .filter(Boolean)
      .join(" "),
    tags: existingClient?.tags ?? null,
    updatedAt: new Date(),
  } satisfies typeof clients.$inferInsert

  const client = existingClient
    ? (
        await db
          .update(clients)
          .set(payload)
          .where(eq(clients.id, existingClient.id))
          .returning()
      )[0]
    : (
        await db
          .insert(clients)
          .values({
            ...payload,
            firstName: payload.firstName,
            lastName: payload.lastName,
          })
          .returning()
      )[0]

  await db
    .update(bookings)
    .set({
      clientId: client.id,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, booking.id))

  await db
    .update(leads)
    .set({
      status: "completed",
      convertedToClientId: client.id,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, lead.id))

  await db.insert(leadActivities).values({
    leadId: lead.id,
    type: "status_change",
    description: `Completed booking synced to client ${client.email}.`,
    metadata: {
      bookingId: booking.id,
      clientId: client.id,
      totalTrips: nextTotalTrips,
      totalSpend: nextTotalSpend.toFixed(2),
    },
    agentId: "crm-client-sync",
  })

  return {
    clientId: client.id,
    bookingId: booking.id,
    created: !existingClient,
    totalTrips: nextTotalTrips,
  }
}
