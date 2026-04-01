import { makePrice } from '@/test/factories/make-price';
import { Service } from './service';

describe('service entity', () => {
  test('should create a service with valid properties', () => {
    const service = new Service({
      name: 'Oil Change',
      description: 'Complete oil change service',
      price: makePrice(),
      durationInMinutes: 60,
      isActive: true,
    });

    expect(service).toBeInstanceOf(Service);
    expect(service).toEqual({
      createdAt: expect.any(Date),
      description: 'Complete oil change service',
      durationInMinutes: 60,
      id: expect.any(String),
      isActive: true,
      name: 'Oil Change',
      price: {
        value: 100,
      },
      updatedAt: expect.any(Date),
    } as unknown as Service);
  });
});
