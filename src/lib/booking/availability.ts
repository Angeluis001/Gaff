import { and, asc, eq, gte, inArray, lte } from "drizzle-orm"

import { db } from "@/lib/db"
import { boatAvailability } from "@/lib/db/schema"
import type {
  BookingAvailabilityEntry,
  BookingAvailabilityResponse,
  BookingAvailabilityStatus,
  BookingBoatOption,
} from "@/types/booking"

import { getSellableBoats } from "./fleet-sync"
import { normalizeTripDate } from "./validation"

function toDateKey(value: Date) {
  return value.toISOString().slice(0, 10)
}

function startOfRange(reference = new Date()) {
  const normalized = new Date(reference)
  normalized.setUTCHours(12, 0, 0, 0)
  return normalized
}

function createDefaultAvailability(boats: BookingBoatOption[], start: Date, days: number) {
  const entries: BookingAvailabilityEntry[] = []

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const nextDate = new Date(start)
    nextDate.setUTCDate(start.getUTCDate() + dayOffset)
    const dateKey = toDateKey(nextDate)

    boats.forEach((boat) => {
      entries.push({
        date: dateKey,
        boatId: boat.id,
        boatSlug: boat.slug,
        status: "available",
      })
    })
  }

  return entries
}

function mapAvailabilityStatus(row: {
  isAvailable: boolean | null
  reason: string | null
}): BookingAvailabilityStatus {
  if (row.isAvailable) {
    return "available"
  }

  if (row.reason === "maintenance") {
    return "maintenance"
  }

  return "booked"
}

export async function getBookingAvailability(days = 45): Promise<BookingAvailabilityResponse> {
  const boats = await getSellableBoats()
  const start = startOfRange()
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + days - 1)

  const rows = await db
    .select({
      boatId: boatAvailability.boatId,
      date: boatAvailability.date,
      isAvailable: boatAvailability.isAvailable,
      reason: boatAvailability.reason,
    })
    .from(boatAvailability)
    .where(
      and(
        inArray(
          boatAvailability.boatId,
          boats.map((boat) => boat.id)
        ),
        gte(boatAvailability.date, start),
        lte(boatAvailability.date, end)
      )
    )
    .orderBy(asc(boatAvailability.date))

  const defaultEntries = createDefaultAvailability(boats, start, days)
  const overrides = new Map<string, BookingAvailabilityEntry>()

  rows.forEach((row) => {
    const dateKey = toDateKey(row.date)
    const boat = boats.find((entry) => entry.id === row.boatId)
    if (!boat) {
      return
    }

    overrides.set(`${row.boatId}:${dateKey}`, {
      date: dateKey,
      boatId: row.boatId,
      boatSlug: boat.slug,
      status: mapAvailabilityStatus(row),
    })
  })

  return {
    updatedAt: new Date().toISOString(),
    boats,
    availability: defaultEntries.map(
      (entry) => overrides.get(`${entry.boatId}:${entry.date}`) ?? entry
    ),
  }
}

export async function ensureBoatDayAvailable(boatId: string, date: string) {
  const tripDate = normalizeTripDate(date)

  const existing = await db
    .select()
    .from(boatAvailability)
    .where(and(eq(boatAvailability.boatId, boatId), eq(boatAvailability.date, tripDate)))

  if (existing.some((entry) => entry.isAvailable === false)) {
    throw new Error("That boat is no longer available for the selected date.")
  }

  return tripDate
}

export async function blockBoatAvailability({
  boatId,
  bookingId,
  date,
  reason = "booked",
}: {
  boatId: string
  bookingId: string
  date: Date
  reason?: string
}) {
  await db
    .insert(boatAvailability)
    .values({
      boatId,
      bookingId,
      date,
      isAvailable: false,
      reason,
    })
    .onConflictDoUpdate({
      target: [boatAvailability.boatId, boatAvailability.date],
      set: {
        bookingId,
        isAvailable: false,
        reason,
      },
    })
}
