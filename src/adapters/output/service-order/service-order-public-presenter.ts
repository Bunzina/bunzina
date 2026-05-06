import type { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderPublicResponse } from './dtos/service-order-public-response';

export const ServiceOrderPublicPresenter = {
  toHttp(serviceOrder: ServiceOrder): ServiceOrderPublicResponse {
    return {
      status: serviceOrder.status,
      serviceItems: serviceOrder.serviceItems.map((item) => ({
        description: item.description,
        price: item.price.value,
      })),
      autoPartItems: serviceOrder.autoPartItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.value,
        totalPrice: item.totalPrice?.value,
      })),
      createdAt: serviceOrder.createdAt,
      updatedAt: serviceOrder.updatedAt,
      approvedAt: serviceOrder.approvedAt,
      startedAt: serviceOrder.startedAt,
      completedAt: serviceOrder.completedAt,
      deliveredAt: serviceOrder.deliveredAt,
    };
  },
};