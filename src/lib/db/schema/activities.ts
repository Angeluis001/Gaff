import { pgTable, text, timestamp, serial, uuid, jsonb } from 'drizzle-orm/pg-core';
import { leads } from './leads';

export const leadActivities = pgTable('lead_activities', {
  id: serial('id').primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id).notNull(),
  type: text('type').notNull(), // 'email_sent', 'whatsapp_sent', 'status_change', 'note', 'call'
  description: text('description').notNull(),
  metadata: jsonb('metadata'),
  agentId: text('agent_id'), // which agent performed the action
  createdAt: timestamp('created_at').defaultNow(),
});
