import { makeService } from '@/test/factories/make-service';
import type { SQL } from 'bun';
import { mockFn } from 'bun-mock-extended';
import { ServiceRepository } from './service-repository';

describe('Service Repository', () => {
  const mockClient = mockFn<SQL>();

  test('should create a service', async () => {
    const repository = new ServiceRepository(mockClient);
    const service = makeService();

    const result = await repository.create(service);

    expect(result).toMatchObject({
      createdAt: expect.any(Date),
      description: 'Complete oil change service',
      durationInMinutes: 60,
      id: expect.any(String),
      isActive: true,
      name: 'Oil Change',
      price: {
        value: 100,
      },
    });
    expect(mockClient).toHaveBeenCalled();
  });

  test('should find a service by ID', async () => {
    const repository = new ServiceRepository(mockClient);
    const service = makeService();

    mockClient.mockResolvedValueOnce([
      {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price.value,
        duration_in_minutes: service.durationInMinutes,
        is_active: service.isActive,
        created_at: service.createdAt,
        updated_at: service.updatedAt,
      },
    ]);

    const result = await repository.findById(service.id!);

    expect(result).toMatchObject({
      createdAt: expect.any(Date),
      description: 'Complete oil change service',
      durationInMinutes: 60,
      id: expect.any(String),
      isActive: true,
      name: 'Oil Change',
      price: {
        value: 100,
      },
    });
    expect(mockClient).toHaveBeenCalled();
  });

  test('should return null if service not found by ID', async () => {
    const repository = new ServiceRepository(mockClient);

    mockClient.mockResolvedValueOnce([]);

    const result = await repository.findById('non-existent-id');

    expect(result).toBeNull();
    expect(mockClient).toHaveBeenCalled();
  });

  test('should update a service', async () => {
    const repository = new ServiceRepository(mockClient);
    const service = makeService();

    const result = await repository.update(service);

    expect(result).toMatchObject({
      createdAt: expect.any(Date),
      description: 'Complete oil change service',
      durationInMinutes: 60,
      id: expect.any(String),
      isActive: true,
      name: 'Oil Change',
      price: {
        value: 100,
      },
    });
    expect(mockClient).toHaveBeenCalled();
  });

  test('should delete a service by ID', async () => {
    const repository = new ServiceRepository(mockClient);
    const serviceId = 'service-id';

    await repository.delete(serviceId);

    expect(mockClient).toHaveBeenCalled();
  });
});
