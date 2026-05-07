export interface ServiceItemResponse {
  id: string;
  serviceId: string;
  price: number;
  isCompleted: boolean;
  description?: string;
  finishedAt?: Date;
  executionTimeMs?: number;
}
