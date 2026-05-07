import { makeServiceItem } from '@/test/factories/make-service-item';
import { describe, expect, test } from 'bun:test';
import { ServiceItemPresenter } from './service-item-presenter';

describe('service item presenter', () => {
  test('should convert a service item entity to http response', () => {
    const serviceItem = makeServiceItem();

    const response = ServiceItemPresenter.toHttp(serviceItem as any);

    expect(response).toMatchObject({
      id: expect.any(String),
      serviceId: 'service-id',
      price: 100,
      description: 'Complete oil change service for your vehicle.',
      isCompleted: false,
    });
  });

  test('should map price value when price is a value object', () => {
    const serviceItem = makeServiceItem({ price: { value: 250 } as any });

    const response = ServiceItemPresenter.toHttp(serviceItem as any);

    expect(response.price).toBe(250);
  });
});
