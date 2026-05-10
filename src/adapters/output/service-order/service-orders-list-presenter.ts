import type { ServiceOrder } from '@/domain/service-order/entities/service-order';
import { ServiceOrderPresenter } from './service-order-presenter';
import type { ServiceOrdersListResponse } from './dtos/service-orders-list-response';

export const ServiceOrdersListPresenter = {
  toHttp(
    serviceOrders: ServiceOrder[],
    page: number,
    limit: number,
  ): ServiceOrdersListResponse {
    return {
      data: serviceOrders.map((serviceOrder) =>
        ServiceOrderPresenter.toHttp(serviceOrder),
      ),
      pagination: {
        page,
        limit,
      },
    };
  },
};