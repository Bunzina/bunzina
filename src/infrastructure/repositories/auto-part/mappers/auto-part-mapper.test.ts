import { makeAutoPart } from '@/test/factories/make-auto-part';
import { describe, expect, test } from 'bun:test';
import { AutoPartMapper } from './auto-part-mapper';

describe('auto part mapper', () => {
  test('should convert auto part to database format', () => {
    const autoPart = makeAutoPart();

    const dbRecord = AutoPartMapper.toDatabase(autoPart);

    expect(dbRecord).toEqual({
      id: autoPart.id!,
      name: 'Brake Pad',
      description: 'High-quality brake pad for improved stopping power.',
      price: autoPart.price.value,
      stock: 100,
      created_at: autoPart.createdAt,
      updated_at: autoPart.updatedAt,
    });
  });

  test('should convert database record to auto part entity', () => {
    const dbRecord = {
      id: 'auto-part-id',
      name: 'Air Filter',
      description: 'Premium air filter for better engine performance.',
      price: 5000,
      stock: 50,
      created_at: new Date('2026-01-15'),
      updated_at: new Date('2026-01-15'),
    };

    const autoPart = AutoPartMapper.toDomain(dbRecord);

    expect(autoPart.id).toBe('auto-part-id');
    expect(autoPart.name).toBe('Air Filter');
    expect(autoPart.description).toBe(
      'Premium air filter for better engine performance.',
    );
    expect(autoPart.price.value).toBe(5000);
    expect(autoPart.stock).toBe(50);
    expect(autoPart.createdAt).toEqual(new Date('2026-01-15'));
    expect(autoPart.updatedAt).toEqual(new Date('2026-01-15'));
  });

  test('should preserve value objects when mapping', () => {
    const autoPart = makeAutoPart({
      name: 'Oil Filter',
      description: 'Synthetic oil filter',
      stock: 75,
    });

    const dbRecord = AutoPartMapper.toDatabase(autoPart);
    const reconstructed = AutoPartMapper.toDomain(dbRecord);

    expect(reconstructed.price.value).toBe(autoPart.price.value);
    expect(reconstructed.name).toBe(autoPart.name);
    expect(reconstructed.stock).toBe(autoPart.stock);
  });
});
