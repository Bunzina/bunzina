import type { ServiceOrder } from '../entities/service-order';
import type { ServiceOrderStatus } from '../types/service-order-status';

export interface FindServiceOrdersFilters {
  customerId?: string;
  status?: ServiceOrderStatus;
}

export interface FindServiceOrdersParams {
  page: number;
  limit: number;
  filters?: FindServiceOrdersFilters;
}

export interface ServiceOrderRepository {
  create(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  findById(id: string): Promise<ServiceOrder | null>;
  findByParams(params: FindServiceOrdersParams): Promise<ServiceOrder[]>;
  update(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  delete(id: string): Promise<void>;
}
