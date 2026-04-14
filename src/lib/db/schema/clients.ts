import { pgTable, text, timestamp, integer, boolean, decimal, uuid, jsonb } from 'drizzle-orm/pg-core';
import { boatCategoryEnum } from './enums';

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  whatsappNumber: text('whatsapp_number'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('US'),
  preferredSpecies: jsonb('preferred_species').$type<string[]>(),
  preferredBoatCategory: boatCategoryEnum('preferred_boat_category'),
  totalTrips: integer('total_trips').default(0),
  totalSpend: decimal('total_spend', { precision: 10, scale: 2 }).default('0'),
  lastTripDate: timestamp('last_trip_date'),
  communicationPreference: text('communication_preference').default('email'),
  optInMarketing: boolean('opt_in_marketing').default(true),
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
