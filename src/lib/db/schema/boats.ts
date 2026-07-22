import { pgTable, text, timestamp, integer, boolean, decimal, uuid, jsonb } from 'drizzle-orm/pg-core';
import { boatCategoryEnum } from './enums';

export const boats = pgTable('boats', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: boatCategoryEnum('category').notNull(),
  capacity: integer('capacity').notNull(),
  length: text('length'),
  description: text('description'),
  features: jsonb('features').$type<string[]>(),
  images: jsonb('images').$type<string[]>(),
  priceHalfDay: decimal('price_half_day', { precision: 10, scale: 2 }),
  priceFullDay: decimal('price_full_day', { precision: 10, scale: 2 }),
  stripeProductHalfDayId: text('stripe_product_half_day_id'),
  stripeProductFullDayId: text('stripe_product_full_day_id'),
  stripePriceHalfDayId: text('stripe_price_half_day_id'),
  stripePriceFullDayId: text('stripe_price_full_day_id'),
  stripeDepositPriceHalfDayId: text('stripe_deposit_price_half_day_id'),
  stripeDepositPriceFullDayId: text('stripe_deposit_price_full_day_id'),
  captainName: text('captain_name'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
