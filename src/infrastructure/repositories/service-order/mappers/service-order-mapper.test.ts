import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeAutoPartItem } from '@/test/factories/make-auto-part-item';
import { makeServiceItem } from '@/test/factories/make-service-item';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { describe, expect, test } from 'bun:test';
import {
  ServiceOrderAutoPartItemMapper,
  ServiceOrderMapper,
  ServiceOrderServiceItemMapper,
} from './service-order-mapper';

describe('service order mapper', () => {
  test('should map service order to database record', () => {
    const createdAt = new Date('2026-03-01T10:00:00.000Z');
    const updatedAt = new Date('2026-03-02T10:00:00.000Z');
    const serviceOrder = makeServiceOrder({
      id: 'service-order-id',
      createdAt,
      updatedAt,
    });

    const record = ServiceOrderMapper.toDatabase(serviceOrder);

    expect(record).toEqual({
      id: 'service-order-id',
      customer_id: 'customer-123',
      vehicle_id: 'vehicle-123',
      status: ServiceOrderStatus.RECEIVED,
      quote_services_total: 300,
      quote_auto_parts_total: 200,
      quote_total: 500,
      created_at: createdAt,
      updated_at: updatedAt,
      approved_at: null,
      started_at: null,
      completed_at: null,
      delivered_at: null,
    });
  });

  test('should map service item to database record', () => {
    const serviceItem = makeServiceItem({
      id: 'service-item-id',
    });

    const record = ServiceOrderServiceItemMapper.toDatabase(
      'service-order-id',
      serviceItem,
    );

    expect(record).toEqual(
      expect.objectContaining({
        id: 'service-item-id',
        service_order_id: 'service-order-id',
        service_id: 'service-id',
        price: 100,
        description: 'Complete oil change service for your vehicle.',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        is_completed: false,
        finished_at: null,
      }),
    );
  });

  test('should map auto part item to database record', () => {
    const autoPartItem = makeAutoPartItem({
      id: 'auto-part-item-id',
      description: 'Oil filter',
    });

    const record = ServiceOrderAutoPartItemMapper.toDatabase(
      'service-order-id',
      autoPartItem,
    );

    expect(record).toEqual({
      id: 'auto-part-item-id',
      service_order_id: 'service-order-id',
      auto_part_id: 'auto-part-id',
      quantity: 2,
      unit_price: 100,
      total_price: 200,
      description: 'Oil filter',
    });
  });

  test('should map database records to service order entity', () => {
    const createdAt = new Date('2026-03-10T08:00:00.000Z');
    const updatedAt = new Date('2026-03-10T09:00:00.000Z');

    const record = {
      id: 'service-order-id',
      customer_id: 'customer-001',
      vehicle_id: 'vehicle-001',
      status: ServiceOrderStatus.RECEIVED,
      quote_services_total: 120,
      quote_auto_parts_total: 80,
      quote_total: 200,
      created_at: createdAt,
      updated_at: updatedAt,
      approved_at: null,
      started_at: null,
      completed_at: null,
      delivered_at: null,
    };

    const serviceItemRecords = [
      {
        id: 'service-item-1',
        service_order_id: 'service-order-id',
        service_id: 'service-001',
        price: 120,
        description: null,
      },
    ];

    const autoPartItemRecords = [
      {
        id: 'auto-part-item-1',
        service_order_id: 'service-order-id',
        auto_part_id: 'auto-part-001',
        quantity: 2,
        unit_price: 40,
        total_price: 80,
        description: null,
      },
    ];

    const serviceOrder = ServiceOrderMapper.toDomain(
      record,
      serviceItemRecords,
      autoPartItemRecords,
    );

    expect(serviceOrder).toEqual(
      expect.objectContaining({
        id: 'service-order-id',
        customerId: 'customer-001',
        vehicleId: 'vehicle-001',
        status: ServiceOrderStatus.RECEIVED,
        serviceItems: [
          {
            id: 'service-item-1',
            serviceId: 'service-001',
            price: {
              value: 120,
            },
            description: undefined,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            isCompleted: false,
            finishedAt: undefined,
          },
        ],
        autoPartItems: [
          {
            id: 'auto-part-item-1',
            autoPartId: 'auto-part-001',
            quantity: 2,
            unitPrice: {
              value: 40,
            },
            totalPrice: {
              value: 80,
            },
            description: undefined,
          },
        ],
        quote: {
          servicesTotal: 120,
          autoPartsTotal: 80,
          total: 200,
        },
        createdAt,
        updatedAt,
        approvedAt: undefined,
        startedAt: undefined,
        completedAt: undefined,
        deliveredAt: undefined,
      }),
    );
  });
});
