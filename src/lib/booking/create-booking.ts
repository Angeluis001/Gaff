import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { bookings, boats, leads } from "@/lib/db/schema"
import type { BookingFormData, PendingBookingResponse } from "@/types/booking"

import { ensureBoatDayAvailable } from "./availability"
import { getSellableBoats } from "./fleet-sync"
import {
  calculateDepositAmount,
  formatUsdAmount,
  getBoatPrice,
} from "./pricing"
import { validateBookingFormData } from "./validation"

export async function createPendingBooking(
  input: BookingFormData,
  options: {
    source?: typeof leads.$inferSelect["source"]
  } = {}
): Promise<PendingBookingResponse> {
  const payload = validateBookingFormData(input)
  const boatOptions = await getSellableBoats()
  const selectedBoat = boatOptions.find((boat) => boat.id === payload.boatId)

  if (!selectedBoat) {
    throw new Error("Selected boat could not be found.")
  }

  if (payload.guestCount > selectedBoat.capacity) {
    throw new Error(
      `Guest count exceeds boat capacity (${selectedBoat.capacity} guests max).`
    )
  }

  await ensureBoatDayAvailable(payload.boatId, payload.date)

  const totalPrice = getBoatPrice(selectedBoat, payload.tripType)
  const depositAmount = calculateDepositAmount(totalPrice)
  const source = options.source ?? "website"

  const existingLead = await db
    .select()
    .from(leads)
    .where(and(eq(leads.email, payload.email), eq(leads.source, source)))

  const [leadRecord] =
    existingLead.length > 0
      ? await db
          .update(leads)
          .set({
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            preferredDate: payload.tripDate,
            preferredBoatCategory: selectedBoat.category,
            groupSize: payload.guestCount,
            notes: payload.specialRequests ?? null,
            updatedAt: new Date(),
          })
          .where(eq(leads.id, existingLead[0].id))
          .returning()
      : await db
          .insert(leads)
          .values({
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phone: payload.phone,
            source,
            preferredDate: payload.tripDate,
            preferredBoatCategory: selectedBoat.category,
            groupSize: payload.guestCount,
            notes: payload.specialRequests ?? null,
            metadata: {
              tripType: payload.tripType,
              boatId: payload.boatId,
            },
          })
          .returning()

  const [bookingRecord] = await db
    .insert(bookings)
    .values({
      leadId: leadRecord.id,
      boatId: payload.boatId,
      date: payload.tripDate,
      tripType: payload.tripType,
      guests: payload.guestCount,
      status: "pending",
      totalPrice: formatUsdAmount(totalPrice),
      depositAmount: formatUsdAmount(depositAmount),
      balanceDueAmount: formatUsdAmount(totalPrice - depositAmount),
      specialRequests: payload.specialRequests ?? null,
    })
    .returning()

  return {
    bookingId: bookingRecord.id,
    leadId: leadRecord.id,
    totalPrice: bookingRecord.totalPrice,
    depositAmount: bookingRecord.depositAmount ?? formatUsdAmount(depositAmount),
    boatId: payload.boatId,
    tripType: payload.tripType,
    date: payload.date,
  }
}

export async function getPendingBookingForCheckout(bookingId: string) {
  const [booking] = await db
    .select({
      id: bookings.id,
      leadId: bookings.leadId,
      boatId: bookings.boatId,
      date: bookings.date,
      tripType: bookings.tripType,
      guests: bookings.guests,
      status: bookings.status,
      totalPrice: bookings.totalPrice,
      depositAmount: bookings.depositAmount,
      stripeSessionId: bookings.stripeSessionId,
      stripePaymentIntentId: bookings.stripePaymentIntentId,
      specialRequests: bookings.specialRequests,
      boatName: boats.name,
      boatImage: boats.images,
      stripeProductHalfDayId: boats.stripeProductHalfDayId,
      stripeProductFullDayId: boats.stripeProductFullDayId,
      stripePriceHalfDayId: boats.stripePriceHalfDayId,
      stripePriceFullDayId: boats.stripePriceFullDayId,
      stripeDepositPriceHalfDayId: boats.stripeDepositPriceHalfDayId,
      stripeDepositPriceFullDayId: boats.stripeDepositPriceFullDayId,
    })
    .from(bookings)
    .innerJoin(boats, eq(bookings.boatId, boats.id))
    .where(eq(bookings.id, bookingId))

  if (!booking) {
    throw new Error("Pending booking not found.")
  }

  return booking
}
