import { db } from "@/lib/db"
import { boatAvailability, boats } from "@/lib/db/schema"

import { formatCurrency, formatDateTime } from "./formatters"

export interface AdminFleetItem {
  id: string
  name: string
  slug: string
  category: string
  capacity: number
  isActive: boolean
  priceHalfDay: string | null
  priceFullDay: string | null
  maintenanceDays: number
  bookedDays: number
}

export async function getAdminFleet() {
  const [boatRows, availabilityRows] = await Promise.all([
    db.select().from(boats),
    db.select().from(boatAvailability),
  ])

  return boatRows
    .map<AdminFleetItem>((boat) => {
      const boatAvailabilityRows = availabilityRows.filter((entry) => entry.boatId === boat.id)
      return {
        id: boat.id,
        name: boat.name,
        slug: boat.slug,
        category: boat.category,
        capacity: boat.capacity,
        isActive: boat.isActive !== false,
        priceHalfDay: boat.priceHalfDay ? formatCurrency(boat.priceHalfDay) : null,
        priceFullDay: boat.priceFullDay ? formatCurrency(boat.priceFullDay) : null,
        maintenanceDays: boatAvailabilityRows.filter((entry) => entry.reason === "maintenance").length,
        bookedDays: boatAvailabilityRows.filter((entry) => entry.isAvailable === false && entry.reason !== "maintenance").length,
      }
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

export async function getAdminFleetMaintenanceWindows() {
  const [boatRows, availabilityRows] = await Promise.all([
    db.select().from(boats),
    db.select().from(boatAvailability),
  ])

  return availabilityRows
    .filter((entry) => entry.reason === "maintenance")
    .map((entry) => ({
      boatName: boatRows.find((boat) => boat.id === entry.boatId)?.name ?? "Unknown boat",
      date: formatDateTime(entry.date),
      reason: entry.reason,
      isAvailable: entry.isAvailable,
    }))
}
