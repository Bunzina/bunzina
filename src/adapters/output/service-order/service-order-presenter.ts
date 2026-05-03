import type { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderResponse } from './dtos/service-order-response';

export const ServiceOrderPresenter = {
  toHttp(serviceOrder: ServiceOrder): ServiceOrderResponse {
    return {
      id: serviceOrder.id!,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: serviceOrder.status,
      serviceItems: serviceOrder.serviceItems.map((item) => ({
        id: item.id!,
        serviceId: item.serviceId,
        price: item.price.value,
        description: item.description,
      })),
      autoPartItems: serviceOrder.autoPartItems.map((item) => ({
        id: item.id!,
        autoPartId: item.autoPartId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.value,
        totalPrice: item.totalPrice?.value,
        description: item.description,
      })),
      quote: {
        servicesTotal: serviceOrder.quote.servicesTotal,
        autoPartsTotal: serviceOrder.quote.autoPartsTotal,
        total: serviceOrder.quote.total,
      },
      createdAt: serviceOrder.createdAt,
      updatedAt: serviceOrder.updatedAt,
      approvedAt: serviceOrder.approvedAt,
      startedAt: serviceOrder.startedAt,
      completedAt: serviceOrder.completedAt,
      deliveredAt: serviceOrder.deliveredAt,
    };
  },
};
