import { makeServiceOrder } from '@/test/factories/make-service-order';
import { describe, expect, test } from 'bun:test';
import { ServiceOrderPresenter } from './service-order-presenter';

describe('service order presenter', () => {
  test('should convert a service order entity to http response', () => {
    const serviceOrder = makeServiceOrder();

    const response = ServiceOrderPresenter.toHttp(serviceOrder);

    expect(response).toMatchObject({
      id: expect.any(String),
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      status: 'RECEIVED',
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: 'service-id',
          price: 100,
          description: 'Complete oil change service for your vehicle.',
          isCompleted: false,
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: 'auto-part-id',
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200,
          description: undefined,
        },
      ],
      quote: {
        servicesTotal: 300,
        autoPartsTotal: 200,
        total: 500,
      },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      approvedAt: undefined,
      startedAt: undefined,
      completedAt: undefined,
      deliveredAt: undefined,
    });
  });

  test('should map item prices to numbers', () => {
    const serviceOrder = makeServiceOrder();

    const response = ServiceOrderPresenter.toHttp(serviceOrder);

    expect(response).toMatchObject({
      id: expect.any(String),
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      status: 'RECEIVED',
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: 'service-id',
          price: 100,
          description: 'Complete oil change service for your vehicle.',
          isCompleted: false,
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: 'auto-part-id',
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200,
          description: undefined,
        },
      ],
      quote: {
        servicesTotal: 300,
        autoPartsTotal: 200,
        total: 500,
      },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      approvedAt: undefined,
      startedAt: undefined,
      completedAt: undefined,
      deliveredAt: undefined,
    });
  });
});
