export type BoatCategory = 'standard' | 'midsize' | 'large' | 'luxury';
export type TripType = 'half_day' | 'full_day' | 'overnight';

export interface Boat {
  id: string;
  name: string;
  slug: string;
  category: BoatCategory;
  capacity: number;
  length?: string;
  description?: string;
  features?: string[];
  images?: string[];
  priceHalfDay?: string;
  priceFullDay?: string;
  captainName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
