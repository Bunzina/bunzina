import { makeAutoPart } from '@/test/factories/make-auto-part';
import { makePrice } from '@/test/factories/make-price';
import { SQL } from 'bun';
import { mockFn } from 'bun-mock-extended';
import { describe, expect, test, type Mock } from 'bun:test';
import { AutoPartRepository } from './auto-part-repository';

describe('auto part repository', () => {
  test('should create an auto part and return it', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new AutoPartRepository(mockClient as unknown as SQL);
    const autoPart = makeAutoPart();

    const result = await repository.create(autoPart);

    expect(result).toEqual(autoPart);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should find an auto part by name', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    const autoPartRecord = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Brake Pad',
      description: 'High-quality brake pad for improved stopping power.',
      price: 10000,
      stock: 100,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockClient.mockResolvedValue([autoPartRecord]);

    const repository = new AutoPartRepository(mockClient as unknown as SQL);

    const result = await repository.findByName('Brake Pad');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(result?.name).toBe('Brake Pad');
    expect(result?.price.value).toBe(10000);
    expect(result?.stock).toBe(100);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should return null if auto part not found by name', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new AutoPartRepository(mockClient as unknown as SQL);

    const result = await repository.findByName('Non-existent Part');

    expect(result).toBeNull();
    expect(mockClient).toHaveBeenCalled();
  });

  test('should find an auto part by id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    const autoPartRecord = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Brake Pad',
      description: 'High-quality brake pad for improved stopping power.',
      price: 10000,
      stock: 100,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockClient.mockResolvedValue([autoPartRecord]);

    const repository = new AutoPartRepository(mockClient as unknown as SQL);

    const result = await repository.findById(
      '550e8400-e29b-41d4-a716-446655440001',
    );

    expect(result).not.toBeNull();
    expect(result?.id).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(result?.name).toBe('Brake Pad');
    expect(mockClient).toHaveBeenCalled();
  });

  test('should return null if auto part not found by id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new AutoPartRepository(mockClient as unknown as SQL);

    const result = await repository.findById('non-existent-id');

    expect(result).toBeNull();
    expect(mockClient).toHaveBeenCalled();
  });

  test('should list paginated auto parts with filters', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    const autoPartRecord = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Brake Pad',
      description: 'High-quality brake pad for improved stopping power.',
      price: 10000,
      stock: 100,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockClient.mockResolvedValue([autoPartRecord]);

    const repository = new AutoPartRepository(mockClient as unknown as SQL);

    const result = await repository.findByParams({
      page: 1,
      limit: 20,
      filters: {
        name: 'Brake',
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(result[0]?.name).toBe('Brake Pad');
    expect(mockClient).toHaveBeenCalled();
  });

  test('should update an existing auto part', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new AutoPartRepository(mockClient as unknown as SQL);
    const autoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Brake Pad',
      description: 'High-quality brake pad',
      price: makePrice(12000),
      stock: 50,
    });

    const result = await repository.update(autoPart);

    expect(result).toEqual(autoPart);
  });

  test('should soft delete an auto part', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    mockClient.mockResolvedValue([]);

    const repository = new AutoPartRepository(mockClient as unknown as SQL);
    const autoPartId = '550e8400-e29b-41d4-a716-446655440001';

    await repository.delete(autoPartId);

    expect(mockClient).toHaveBeenCalled();
  });
});
