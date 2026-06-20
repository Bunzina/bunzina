import { makeService } from '@/test/factories/make-service';
import type { SQL } from 'bun';
import { any, mockFn } from 'bun-mock-extended';
import { ServiceRepository } from './service-repository';

type MockSqlClient = SQL & {
  calledWith(value: unknown): {
    mockResolvedValueOnce(value: unknown[]): void;
    mockRejectedValueOnce(error: Error): void;
  };
  mockResolvedValueOnce(value: unknown[]): void;
  mockImplementationOnce(
    implementation: (...args: unknown[]) => Promise<unknown[]>,
  ): void;
  mockImplementation(
    implementation: (...args: unknown[]) => Promise<unknown[]>,
  ): void;
};

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

    (mockClient as unknown as MockSqlClient)
      .calledWith(any())
      .mockResolvedValueOnce([
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

    (mockClient as unknown as MockSqlClient)
      .calledWith(any())
      .mockResolvedValueOnce([]);

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

  test('should increment execution stats for a service', async () => {
    const repository = new ServiceRepository(mockClient);
    const serviceId = 'service-123';
    const executionTimeMs = 5000;

    await repository.incrementExecutionStats(serviceId, executionTimeMs);

    expect(mockClient).toHaveBeenCalled();
  });

  test('should handle error when incrementing execution stats fails', async () => {
    const mockClientError = mockFn<SQL>();
    (mockClientError as unknown as MockSqlClient).mockImplementation(() =>
      Promise.reject(new Error('DB error')),
    );
    const repository = new ServiceRepository(mockClientError);

    await expect(
      repository.incrementExecutionStats('service-123', 5000),
    ).rejects.toThrow('DB error');
  });

  test('should list paginated services with filters', async () => {
    const mockClient = mockFn<SQL>();
    const service = makeService();
    const serviceRecord = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.value,
      duration_in_minutes: service.durationInMinutes,
      is_active: service.isActive,
      created_at: service.createdAt,
      updated_at: service.updatedAt,
    };
    (mockClient as unknown as MockSqlClient).mockImplementation(() =>
      Promise.resolve([serviceRecord]),
    );
    const repository = new ServiceRepository(mockClient);

    const result = await repository.findByParams({
      page: 1,
      limit: 10,
      filters: {
        name: 'Oil',
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
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
  });

  test('should list paginated services without filters', async () => {
    const mockClient = mockFn<SQL>();
    const service = makeService();
    const serviceRecord = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.value,
      duration_in_minutes: service.durationInMinutes,
      is_active: service.isActive,
      created_at: service.createdAt,
      updated_at: service.updatedAt,
    };
    (mockClient as unknown as MockSqlClient).mockImplementation(() =>
      Promise.resolve([serviceRecord]),
    );
    const repository = new ServiceRepository(mockClient);

    const result = await repository.findByParams({
      page: 1,
      limit: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
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
  });
});
