import { db } from "@/lib/db"
import { bookings, clients } from "@/lib/db/schema"

import { formatCurrency, formatDateTime } from "./formatters"

export interface AdminClientListFilters {
  query?: string
  page?: number
  pageSize?: number
}

export interface AdminClientListItem {
  id: string
  name: string
  email: string
  phone: string | null
  country: string | null
  totalTrips: number
  totalSpend: string
  lastTripDate: string | null
  createdAt: string
}

export interface AdminClientDetail {
  client: AdminClientListItem & {
    city: string | null
    state: string | null
    preferredSpecies: string[] | null
    preferredBoatCategory: string | null
    communicationPreference: string | null
    optInMarketing: boolean | null
    notes: string | null
    tags: string[] | null
    whatsappNumber: string | null
  }
  trips: Array<{
    id: string
    boatId: string
    tripType: string
    status: string
    date: string
    guests: number
    totalPrice: string
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

export async function getAdminClientList(filters: AdminClientListFilters = {}) {
  const [clientRows, bookingRows] = await Promise.all([
    db.select().from(clients),
    db.select().from(bookings),
  ])

  const filteredRows = clientRows.filter((client) => {
      const query = filters.query?.trim().toLowerCase()
      if (!query) {
        return true
      }

    return [
        `${client.firstName} ${client.lastName ?? ""}`.trim(),
        client.email,
        client.phone ?? "",
        client.country ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
    .sort((left, right) => {
      const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0
      return rightDate - leftDate
    })

  const items = filteredRows.map<AdminClientListItem>((client) => {
    const clientBookings = bookingRows.filter((booking) => booking.clientId === client.id)

    return {
      id: client.id,
      name: `${client.firstName} ${client.lastName}`.trim(),
      email: client.email,
      phone: client.phone,
      country: client.country,
      totalTrips: client.totalTrips ?? clientBookings.length,
      totalSpend: formatCurrency(
        client.totalSpend ??
          clientBookings.reduce((sum, booking) => sum + Number(booking.totalPrice ?? 0), 0)
      ),
      lastTripDate: client.lastTripDate ? formatDateTime(client.lastTripDate) : null,
      createdAt: formatDateTime(client.createdAt),
    }
  })

  return paginateRows(items, filters.page, filters.pageSize)
}

export async function getAdminClientDetail(clientId: string): Promise<AdminClientDetail | null> {
  const clientRows = await db.select().from(clients)
  const targetClient = clientRows.find((client) => client.id === clientId)

  if (!targetClient) {
    return null
  }

  const clientTrips = (await db.select().from(bookings))
    .filter((booking) => booking.clientId === clientId)
    .sort((left, right) => {
      const leftDate = left.date ? new Date(left.date).getTime() : 0
      const rightDate = right.date ? new Date(right.date).getTime() : 0
      return rightDate - leftDate
    })

  return {
    client: {
      id: targetClient.id,
      name: `${targetClient.firstName} ${targetClient.lastName}`.trim(),
      email: targetClient.email,
      phone: targetClient.phone,
      country: targetClient.country,
      totalTrips: targetClient.totalTrips ?? clientTrips.length,
      totalSpend: formatCurrency(targetClient.totalSpend ?? clientTrips.reduce((sum, booking) => sum + Number(booking.totalPrice ?? 0), 0)),
      lastTripDate: targetClient.lastTripDate ? formatDateTime(targetClient.lastTripDate) : null,
      createdAt: formatDateTime(targetClient.createdAt),
      city: targetClient.city,
      state: targetClient.state,
      preferredSpecies: targetClient.preferredSpecies ?? null,
      preferredBoatCategory: targetClient.preferredBoatCategory ?? null,
      communicationPreference: targetClient.communicationPreference,
      optInMarketing: targetClient.optInMarketing,
      notes: targetClient.notes,
      tags: targetClient.tags ?? null,
      whatsappNumber: targetClient.whatsappNumber,
    },
    trips: clientTrips.map((booking) => ({
      id: booking.id,
      boatId: booking.boatId,
      tripType: booking.tripType,
      status: booking.status ?? "pending",
      date: formatDateTime(booking.date),
      guests: booking.guests,
      totalPrice: formatCurrency(booking.totalPrice),
    })),
  }
}
