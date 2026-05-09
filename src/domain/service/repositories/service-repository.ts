import type { Service } from '../entities/service';

export interface ServiceRepository {
  create(service: Service): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  update(service: Service): Promise<Service>;
  delete(id: string): Promise<void>;
  incrementExecutionStats(serviceId: string, newTimeMs: number): Promise<void>;
}
