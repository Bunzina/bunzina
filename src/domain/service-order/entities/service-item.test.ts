import { makePrice } from '@/test/factories/make-price';
import { ServiceItem } from './service-item';

describe('service item child entity', () => {
  test('should create a service item with valid properties', () => {
    const serviceItem = new ServiceItem({
      serviceId: 'service-id',
      description: 'Oil Change',
      price: makePrice(150),
    });

    expect(serviceItem).toBeInstanceOf(ServiceItem);
    expect(serviceItem).toEqual(
      expect.objectContaining({
        description: 'Oil Change',
        id: expect.any(String),
        price: { value: 150 },
        serviceId: 'service-id',
      } as unknown as ServiceItem),
    );
  });

  test('should throw an error when creating a service item with a negative price', () => {
    expect(
      () =>
        new ServiceItem({
          description: 'Oil Change',
          price: makePrice(-150),
          serviceId: 'service-id',
        }),
    ).toThrow('Price cannot be negative');
  });
});
