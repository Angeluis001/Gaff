import { db } from "@/lib/db"
import { boatAvailability, bookings, boats, leads } from "@/lib/db/schema"

import { formatCurrency, formatDateTime } from "./formatters"

export interface AdminBookingListFilters {
  query?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface AdminBookingListItem {
  id: string
  boatName: string
  date: string
  tripType: string
  guests: number
  status: string
  totalPrice: string
  depositAmount: string | null
  leadName: string | null
}

export interface AdminBookingDetail {
  booking: AdminBookingListItem & {
    leadId: string | null
    boatId: string
    internalNotes: string | null
    specialRequests: string | null
    balanceDueAmount: string | null
    stripeSessionId: string | null
    stripePaymentIntentId: string | null
    depositPaidAt: string | null
    balancePaidAt: string | null
    createdAt: string | null
    updatedAt: string | null
  }
  availability: Array<{
    date: string
    isAvailable: boolean | null
    reason: string | null
  }>
}

function paginateRows<T>(rows: T[], page = 1, pageSize = 10) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10
  const offset = (safePage - 1) * safePageSize

  return {
    items: rows.slice(offset, offset + safePageSize),
    total: rows.length,
    page: safePage,
    pageSize: safePageSize,
  }
}

export async function getAdminBookingList(filters: AdminBookingListFilters = {}) {
  const [bookingRows, boatRows, leadRows] = await Promise.all([
    db.select().from(bookings),
    db.select().from(boats),
    db.select().from(leads),
  ])

  const filteredRows = bookingRows.filter((booking) => {
      const query = filters.query?.trim().toLowerCase()
      if (query) {
        const boat = boatRows.find((entry) => entry.id === booking.boatId)
        const lead = leadRows.find((entry) => entry.id === booking.leadId)
        const haystack = [
          boat?.name ?? "",
          lead ? `${lead.firstName} ${lead.lastName ?? ""}`.trim() : "",
          booking.status ?? "pending",
          booking.tripType,
          booking.date ? new Date(booking.date).toISOString() : "",
        ]
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(query)) {
          return false
        }
      }

      if (filters.status && booking.status !== filters.status) {
        return false
      }

      return true
    })
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())

  const items = filteredRows.map<AdminBookingListItem>((booking) => {
    const boat = boatRows.find((entry) => entry.id === booking.boatId)
    const lead = leadRows.find((entry) => entry.id === booking.leadId)

    return {
      id: booking.id,
      boatName: boat?.name ?? "Unknown boat",
      date: formatDateTime(booking.date),
      tripType: booking.tripType,
      guests: booking.guests,
      status: booking.status ?? "pending",
      totalPrice: formatCurrency(booking.totalPrice),
      depositAmount: booking.depositAmount ? formatCurrency(booking.depositAmount) : null,
      leadName: lead ? `${lead.firstName} ${lead.lastName ?? ""}`.trim() : null,
    }
  })

  return paginateRows(items, filters.page, filters.pageSize)
}

export async function getAdminBookingDetail(bookingId: string): Promise<AdminBookingDetail | null> {
  const bookingRows = await db.select().from(bookings)
  const targetBooking = bookingRows.find((booking) => booking.id === bookingId)

  if (!targetBooking) {
    return null
  }

  const boatRow = (await db.select().from(boats)).find((boat) => boat.id === targetBooking.boatId)
  const leadRow = targetBooking.leadId
    ? (await db.select().from(leads)).find((lead) => lead.id === targetBooking.leadId)
    : undefined
  const bookingAvailability = (await db.select().from(boatAvailability))
    .filter((entry) => entry.boatId === targetBooking.boatId)
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())

  return {
    booking: {
      id: targetBooking.id,
      boatName: boatRow?.name ?? "Unknown boat",
      date: formatDateTime(targetBooking.date),
      tripType: targetBooking.tripType,
      guests: targetBooking.guests,
      status: targetBooking.status ?? "pending",
      totalPrice: formatCurrency(targetBooking.totalPrice),
      depositAmount: targetBooking.depositAmount ? formatCurrency(targetBooking.depositAmount) : null,
      leadName: leadRow ? `${leadRow.firstName} ${leadRow.lastName ?? ""}`.trim() : null,
      leadId: targetBooking.leadId,
      boatId: targetBooking.boatId,
      internalNotes: targetBooking.internalNotes,
      specialRequests: targetBooking.specialRequests,
      balanceDueAmount: targetBooking.balanceDueAmount ? formatCurrency(targetBooking.balanceDueAmount) : null,
      stripeSessionId: targetBooking.stripeSessionId,
      stripePaymentIntentId: targetBooking.stripePaymentIntentId,
      depositPaidAt: targetBooking.depositPaidAt ? formatDateTime(targetBooking.depositPaidAt) : null,
      balancePaidAt: targetBooking.balancePaidAt ? formatDateTime(targetBooking.balancePaidAt) : null,
      createdAt: targetBooking.createdAt ? formatDateTime(targetBooking.createdAt) : null,
      updatedAt: targetBooking.updatedAt ? formatDateTime(targetBooking.updatedAt) : null,
    },
    availability: bookingAvailability.map((entry) => ({
      date: formatDateTime(entry.date),
      isAvailable: entry.isAvailable,
      reason: entry.reason,
    })),
  }
}
