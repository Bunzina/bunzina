import type { Service } from '../entities/service';

export interface FindServicesParams {
  page: number;
  limit: number;
  filters?: {
    name?: string;
  };
}

export interface ServiceRepository {
  create(service: Service): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  findByParams(params: FindServicesParams): Promise<Service[]>;
  update(service: Service): Promise<Service>;
  delete(id: string): Promise<void>;
  incrementExecutionStats(serviceId: string, newTimeMs: number): Promise<void>;
}
