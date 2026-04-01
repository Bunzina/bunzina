import { makePrice } from '@/test/factories/make-price';
import { AutoPart } from './auto-part';

describe('auto part entity', () => {
  test('should create an auto part with valid properties', () => {
    const autoPart = new AutoPart({
      name: 'Brake Pad',
      description: 'High-quality brake pad for improved stopping power.',
      price: makePrice(),
      stock: 100,
    });

    expect(autoPart).toBeInstanceOf(AutoPart);
    expect(autoPart).toEqual({
      createdAt: expect.any(Date),
      description: 'High-quality brake pad for improved stopping power.',
      id: expect.any(String),
      name: 'Brake Pad',
      price: {
        value: 100,
      },
      stock: 100,
      updatedAt: expect.any(Date),
    } as unknown as AutoPart);
  });
});
