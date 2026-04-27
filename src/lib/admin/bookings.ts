import { db } from "@/lib/db"
import { boatAvailability, bookings, boats, leads } from "@/lib/db/schema"

import { formatCurrency, formatDateTime } from "./formatters"

export interface AdminBookingListFilters {
  query?: string
  status?: string
  tripType?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface AdminBookingListItem {
  id: string
  boatName: string
  boatCategory: string
  date: string
  rawDate: string
  tripType: string
  guests: number
  status: string
  totalPrice: string
  depositAmount: string | null
  depositPaidAt: string | null
  leadName: string | null
  leadId: string | null
}

export interface AdminBookingListSummary {
  total: number
  confirmed: number
  pending: number
  revenue: string
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

  const filteredRows = bookingRows
    .filter((booking) => {
      const query = filters.query?.trim().toLowerCase()
      if (query) {
        const boat = boatRows.find((b) => b.id === booking.boatId)
        const lead = leadRows.find((l) => l.id === booking.leadId)
        const haystack = [
          boat?.name ?? "",
          lead ? `${lead.firstName} ${lead.lastName ?? ""}`.trim() : "",
          booking.status ?? "pending",
          booking.tripType,
          booking.date ? new Date(booking.date).toISOString() : "",
        ]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(query)) return false
      }

      if (filters.status && booking.status !== filters.status) return false
      if (filters.tripType && booking.tripType !== filters.tripType) return false

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom)
        if (new Date(booking.date) < from) return false
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo)
        to.setHours(23, 59, 59, 999)
        if (new Date(booking.date) > to) return false
      }

      return true
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const mappedRows = filteredRows.map<AdminBookingListItem>((booking) => {
    const boat = boatRows.find((b) => b.id === booking.boatId)
    const lead = leadRows.find((l) => l.id === booking.leadId)

    return {
      id: booking.id,
      boatName: boat?.name ?? "Unknown boat",
      boatCategory: boat?.category ?? "standard",
      date: formatDateTime(booking.date),
      rawDate: new Date(booking.date).toISOString().split("T")[0],
      tripType: booking.tripType,
      guests: booking.guests,
      status: booking.status ?? "pending",
      totalPrice: formatCurrency(booking.totalPrice),
      depositAmount: booking.depositAmount ? formatCurrency(booking.depositAmount) : null,
      depositPaidAt: booking.depositPaidAt ? formatDateTime(booking.depositPaidAt) : null,
      leadName: lead ? `${lead.firstName} ${lead.lastName ?? ""}`.trim() : null,
      leadId: booking.leadId ?? null,
    }
  })

  const confirmedStatuses = new Set(["confirmed", "deposit_paid", "in_progress", "completed"])
  const pendingStatuses = new Set(["pending"])

  const summary: AdminBookingListSummary = {
    total: mappedRows.length,
    confirmed: mappedRows.filter((b) => confirmedStatuses.has(b.status)).length,
    pending: mappedRows.filter((b) => pendingStatuses.has(b.status)).length,
    revenue: formatCurrency(
      filteredRows
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + parseFloat(b.totalPrice ?? "0"), 0)
        .toFixed(2)
    ),
  }

  const paginated = paginateRows(mappedRows, filters.page, filters.pageSize)
  return { ...paginated, summary }
}

export async function getAdminBookingDetail(bookingId: string): Promise<AdminBookingDetail | null> {
  const bookingRows = await db.select().from(bookings)
  const targetBooking = bookingRows.find((b) => b.id === bookingId)

  if (!targetBooking) return null

  const boatRow = (await db.select().from(boats)).find((b) => b.id === targetBooking.boatId)
  const leadRow = targetBooking.leadId
    ? (await db.select().from(leads)).find((l) => l.id === targetBooking.leadId)
    : undefined
  const bookingAvailability = (await db.select().from(boatAvailability))
    .filter((e) => e.boatId === targetBooking.boatId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    booking: {
      id: targetBooking.id,
      boatName: boatRow?.name ?? "Unknown boat",
      boatCategory: boatRow?.category ?? "standard",
      date: formatDateTime(targetBooking.date),
      rawDate: new Date(targetBooking.date).toISOString().split("T")[0],
      tripType: targetBooking.tripType,
      guests: targetBooking.guests,
      status: targetBooking.status ?? "pending",
      totalPrice: formatCurrency(targetBooking.totalPrice),
      depositAmount: targetBooking.depositAmount
        ? formatCurrency(targetBooking.depositAmount)
        : null,
      depositPaidAt: targetBooking.depositPaidAt
        ? formatDateTime(targetBooking.depositPaidAt)
        : null,
      leadName: leadRow
        ? `${leadRow.firstName} ${leadRow.lastName ?? ""}`.trim()
        : null,
      leadId: targetBooking.leadId ?? null,
      boatId: targetBooking.boatId,
      internalNotes: targetBooking.internalNotes,
      specialRequests: targetBooking.specialRequests,
      balanceDueAmount: targetBooking.balanceDueAmount
        ? formatCurrency(targetBooking.balanceDueAmount)
        : null,
      stripeSessionId: targetBooking.stripeSessionId,
      stripePaymentIntentId: targetBooking.stripePaymentIntentId,
      balancePaidAt: targetBooking.balancePaidAt
        ? formatDateTime(targetBooking.balancePaidAt)
        : null,
      createdAt: targetBooking.createdAt ? formatDateTime(targetBooking.createdAt) : null,
      updatedAt: targetBooking.updatedAt ? formatDateTime(targetBooking.updatedAt) : null,
    },
    availability: bookingAvailability.map((e) => ({
      date: formatDateTime(e.date),
      isAvailable: e.isAvailable,
      reason: e.reason,
    })),
  }
}
