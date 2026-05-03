import { makeAutoPartItem } from '@/test/factories/make-auto-part-item';
import { makeQuote } from '@/test/factories/make-quote';
import { makeServiceItem } from '@/test/factories/make-service-item';
import { ServiceOrderStatus } from '../types/service-order-status';
import { ServiceOrder } from './service-order';

describe('service order entity', () => {
  test('should create a service order with valid properties', () => {
    const serviceOrder = new ServiceOrder({
      customerId: 'customer-id',
      vehicleId: 'vehicle-id',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [makeServiceItem()],
      autoPartItems: [makeAutoPartItem()],
      quote: makeQuote(),
    });

    expect(serviceOrder).toBeInstanceOf(ServiceOrder);
    expect(serviceOrder).toEqual({
      autoPartItems: [
        {
          autoPartId: 'auto-part-id',
          id: expect.any(String),
          quantity: 2,
          unitPrice: {
            value: 100,
          },
          totalPrice: {
            value: 200,
          },
        },
      ],
      createdAt: expect.any(Date),
      customerId: 'customer-id',
      id: expect.any(String),
      quote: {
        autoPartsTotal: 200,
        servicesTotal: 300,
        total: 500,
      },
      serviceItems: [
        {
          description: 'Complete oil change service for your vehicle.',
          id: expect.any(String),
          price: {
            value: 100,
          },
          serviceId: 'service-id',
        },
      ],
      status: 'RECEIVED',
      updatedAt: expect.any(Date),
      vehicleId: 'vehicle-id',
    } as unknown as ServiceOrder);
  });
});
