export interface ServiceResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInMinutes: number;
  completedCount: number;
  totalExecutionTimeMs: number;
  averageExecutionTimeMs: number | null;
  createdAt: string;
  updatedAt: string;
}
