import type { ServiceItem } from '@/domain/service-order/entities/service-item';
import type { ServiceItemResponse } from './dtos/service-item-response';

export const ServiceItemPresenter = {
  toHttp(item: ServiceItem): ServiceItemResponse {
    return {
      id: item.id!,
      serviceId: item.serviceId,
      price: item.price.value,
      description: item.description,
      isCompleted: item.isCompleted,
      finishedAt: item.finishedAt,
      executionTimeMs: item.executionTimeMs,
    };
  },
};
