export interface VehicleDbSchema {
  id: string;
  customer_id: string;
  license_plate: string;
  model: string;
  brand: string;
  year: number;
  created_at: Date;
  updated_at: Date;
}
