import { pgTable, text, timestamp, integer, uuid, jsonb } from 'drizzle-orm/pg-core';
import { leadStatusEnum, leadSourceEnum, boatCategoryEnum } from './enums';

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  whatsappNumber: text('whatsapp_number'),
  source: leadSourceEnum('source').notNull(),
  status: leadStatusEnum('status').default('new'),
  classification: text('classification'), // hot, warm, cold — GPT-4o-mini classified
  preferredDate: timestamp('preferred_date'),
  preferredBoatCategory: boatCategoryEnum('preferred_boat_category'),
  groupSize: integer('group_size'),
  notes: text('notes'),
  metadata: jsonb('metadata'), // additional form/bot data
  assignedTo: uuid('assigned_to'),
  convertedToClientId: uuid('converted_to_client_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
