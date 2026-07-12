import { Price } from '@/domain/core/value-objects/price';
import { AutoPartItem } from '@/domain/service-order/entities/auto-part-item';
import { ServiceItem } from '@/domain/service-order/entities/service-item';
import { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { Quote } from '@/domain/service-order/value-objects/quote';
import type {
  ServiceOrderAutoPartItemDbSchema,
  ServiceOrderDbSchema,
  ServiceOrderServiceItemDbSchema,
} from '../dtos/service-order-db-schema';

export const ServiceOrderServiceItemMapper = {
  toDatabase(
    serviceOrderId: string,
    serviceItem: ServiceItem,
  ): ServiceOrderServiceItemDbSchema {
    return {
      id: serviceItem.id!,
      service_order_id: serviceOrderId,
      service_id: serviceItem.serviceId,
      price: Number(serviceItem.price.value),
      description: serviceItem.description ?? null,
      created_at: serviceItem.createdAt,
      updated_at: serviceItem.updatedAt,
      is_completed: serviceItem.isCompleted ?? false,
      finished_at: serviceItem.finishedAt ?? null,
      execution_time_ms:
        serviceItem.executionTimeMs !== undefined
          ? Number(serviceItem.executionTimeMs)
          : null,
    };
  },

  toDomain(record: ServiceOrderServiceItemDbSchema): ServiceItem {
    return new ServiceItem({
      id: record.id,
      serviceId: record.service_id,
      price: new Price(record.price),
      description: record.description ?? undefined,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      isCompleted: record.is_completed,
      finishedAt: record.finished_at ?? undefined,
      executionTimeMs: record.execution_time_ms
        ? Number(record.execution_time_ms)
        : undefined,
    });
  },
};

export const ServiceOrderAutoPartItemMapper = {
  toDatabase(
    serviceOrderId: string,
    autoPartItem: AutoPartItem,
  ): ServiceOrderAutoPartItemDbSchema {
    return {
      id: autoPartItem.id!,
      service_order_id: serviceOrderId,
      auto_part_id: autoPartItem.autoPartId,
      quantity: autoPartItem.quantity,
      unit_price: Number(autoPartItem.unitPrice.value),
      total_price:
        autoPartItem.totalPrice?.value !== undefined
          ? Number(autoPartItem.totalPrice.value)
          : null,
      description: autoPartItem.description ?? null,
    };
  },

  toDomain(record: ServiceOrderAutoPartItemDbSchema): AutoPartItem {
    return new AutoPartItem({
      id: record.id,
      autoPartId: record.auto_part_id,
      quantity: record.quantity,
      unitPrice: new Price(record.unit_price),
      totalPrice:
        record.total_price !== null ? new Price(record.total_price) : undefined,
      description: record.description ?? undefined,
    });
  },
};

export const ServiceOrderMapper = {
  toDatabase(serviceOrder: ServiceOrder): ServiceOrderDbSchema {
    return {
      id: serviceOrder.id!,
      customer_id: serviceOrder.customerId,
      vehicle_id: serviceOrder.vehicleId,
      status: serviceOrder.status,
      quote_services_total: Number(serviceOrder.quote.servicesTotal),
      quote_auto_parts_total: Number(serviceOrder.quote.autoPartsTotal),
      quote_total: Number(serviceOrder.quote.total),
      created_at: serviceOrder.createdAt,
      updated_at: serviceOrder.updatedAt,
      approved_at: serviceOrder.approvedAt ?? null,
      started_at: serviceOrder.startedAt ?? null,
      completed_at: serviceOrder.completedAt ?? null,
      delivered_at: serviceOrder.deliveredAt ?? null,
    };
  },

  toDomain(
    record: ServiceOrderDbSchema,
    serviceItems: ServiceOrderServiceItemDbSchema[],
    autoPartItems: ServiceOrderAutoPartItemDbSchema[],
  ): ServiceOrder {
    const quote = new Quote({
      servicesTotal: Number(record.quote_services_total),
      autoPartsTotal: Number(record.quote_auto_parts_total),
    });

    return new ServiceOrder({
      id: record.id,
      customerId: record.customer_id,
      vehicleId: record.vehicle_id,
      status: record.status as ServiceOrderStatus,
      serviceItems: serviceItems.map(ServiceOrderServiceItemMapper.toDomain),
      autoPartItems: autoPartItems.map(ServiceOrderAutoPartItemMapper.toDomain),
      quote,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      approvedAt: record.approved_at ?? undefined,
      startedAt: record.started_at ?? undefined,
      completedAt: record.completed_at ?? undefined,
      deliveredAt: record.delivered_at ?? undefined,
    });
  },
};
