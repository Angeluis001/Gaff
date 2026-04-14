import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { boats } from "@/lib/db/schema"
import { landingBoats } from "@/lib/landing-data"
import type { BookingBoatOption } from "@/types/booking"

function parseCapacity(value: string) {
  const match = value.match(/(\d+)/)
  return match ? Number(match[1]) : 4
}

function parseRateLabel(value: string) {
  return Number(value.replace(/[^0-9.]/g, ""))
}

export async function syncLandingFleetToDatabase() {
  const existingBoats = await db.select().from(boats)

  if (existingBoats.length > 0) {
    return existingBoats
  }

  const inserted = await db
    .insert(boats)
    .values(
      landingBoats.map((boat) => {
        const halfDayPrice = parseRateLabel(boat.rateLabel)
        return {
          name: boat.name,
          slug: boat.slug,
          category: boat.slug,
          capacity: parseCapacity(boat.capacity),
          description: `${boat.name} charter option for Los Cabos sport fishing.`,
          images: [boat.cloudinaryPublicId],
          priceHalfDay: formatPriceValue(halfDayPrice),
          priceFullDay: formatPriceValue(Math.round(halfDayPrice * 1.6)),
          isActive: true,
        }
      })
    )
    .returning()

  return inserted
}

function formatPriceValue(value: number) {
  return value.toFixed(2)
}

export async function getSellableBoats(): Promise<BookingBoatOption[]> {
  await syncLandingFleetToDatabase()

  const activeBoats = await db
    .select()
    .from(boats)
    .where(eq(boats.isActive, true))

  return activeBoats.map((boat) => ({
    id: boat.id,
    slug: boat.slug,
    name: boat.name,
    category: boat.category,
    capacity: boat.capacity,
    priceHalfDay: boat.priceHalfDay,
    priceFullDay: boat.priceFullDay,
  }))
}
