import { makeAutoPart } from '@/test/factories/make-auto-part';
import { describe, expect, test } from 'bun:test';
import { AutoPartPresenter } from './auto-part-presenter';

describe('auto-part presenter', () => {
  test('should convert an auto-part entity to http response', () => {
    const autoPart = makeAutoPart();

    const response = AutoPartPresenter.toHttp(autoPart);

    expect(response).toEqual({
      id: expect.any(String),
      name: 'Brake Pad',
      description: 'High-quality brake pad for improved stopping power.',
      price: expect.any(Number),
      stock: 100,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('should convert an auto-part with custom values', () => {
    const customDate = new Date('2026-02-15');
    const autoPart = makeAutoPart({
      name: 'Air Filter Premium',
      description: 'Advanced air filtration system',
      stock: 50,
      createdAt: customDate,
      updatedAt: customDate,
    });

    const response = AutoPartPresenter.toHttp(autoPart);

    expect(response).toEqual({
      id: expect.any(String),
      name: 'Air Filter Premium',
      description: 'Advanced air filtration system',
      price: expect.any(Number),
      stock: 50,
      createdAt: '2026-02-15',
      updatedAt: '2026-02-15',
    });
  });

  test('should extract price value object correctly', () => {
    const autoPart = makeAutoPart();

    const response = AutoPartPresenter.toHttp(autoPart);

    expect(response.price).toBe(autoPart.price.value);
    expect(typeof response.price).toBe('number');
  });
});
