import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { boats } from "./boats"
import { bookings } from "./bookings"

export const boatAvailability = pgTable(
  "boat_availability",
  {
    id: serial("id").primaryKey(),
    boatId: uuid("boat_id")
      .references(() => boats.id)
      .notNull(),
    date: timestamp("date").notNull(),
    isAvailable: boolean("is_available").default(true),
    reason: text("reason"), // booked, maintenance, weather, custom
    bookingId: uuid("booking_id").references(() => bookings.id),
  },
  (table) => [
    uniqueIndex("boat_availability_boat_date_idx").on(table.boatId, table.date),
  ]
)
