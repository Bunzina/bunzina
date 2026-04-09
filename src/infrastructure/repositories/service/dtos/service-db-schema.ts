export interface ServiceDbSchema {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_in_minutes: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
