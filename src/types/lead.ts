export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'booked'
  | 'completed'
  | 'lost'
  | 'nurture';

export type LeadSource =
  | 'website'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'tripadvisor'
  | 'referral'
  | 'google'
  | 'other';

export type LeadClassification = 'hot' | 'warm' | 'cold';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  classification?: LeadClassification;
  preferredDate?: Date;
  boatInterest?: string;
  partySize?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
