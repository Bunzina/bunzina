export interface ServiceDbSchema {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_in_minutes: number;
  is_active: boolean;
  completed_count: number;
  total_execution_time_ms: number;
  average_execution_time_ms?: number;
  created_at: Date;
  updated_at: Date;
}
