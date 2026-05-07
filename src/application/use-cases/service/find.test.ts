import type { IServiceRepository } from '@/domain/service/repositories/service-repository';
import { makeService } from '@/test/factories/make-service';
import { mock, type MockProxy } from 'bun-mock-extended';
import { FindServiceUseCase } from './find';

describe('Find Service Use Case', () => {
  let serviceRepository: MockProxy<IServiceRepository>;
  let findServiceUseCase: FindServiceUseCase;

  beforeEach(() => {
    serviceRepository = mock();
    findServiceUseCase = new FindServiceUseCase(serviceRepository);
  });

  test('should find a service by id', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const service = makeService({ id: validUUId });

    serviceRepository.findById.calledWith(validUUId).mockResolvedValue(service);
    serviceRepository.getAverageExecutionTimeMs
      .calledWith(validUUId)
      .mockResolvedValue(5000);

    const result = await findServiceUseCase.execute(validUUId);

    expect(result).toMatchObject({
      ...service,
      averageExecutionTimeMs: 5000,
    });
    expect(serviceRepository.findById).toHaveBeenCalledWith(validUUId);
    expect(serviceRepository.getAverageExecutionTimeMs).toHaveBeenCalledWith(
      validUUId,
    );
  });

  test('should throw an error if service is not found', async () => {
    const serviceId = 'non-existing-id';

    serviceRepository.findById.calledWith(serviceId).mockResolvedValue(null);

    await expect(findServiceUseCase.execute(serviceId)).rejects.toThrow(
      'Service not found',
    );
    expect(serviceRepository.findById).toHaveBeenCalledWith(serviceId);
  });

  test('should return service with null averageExecutionTimeMs when no completed items', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440001';
    const service = makeService({ id: validUUId });

    serviceRepository.findById.calledWith(validUUId).mockResolvedValue(service);
    serviceRepository.getAverageExecutionTimeMs
      .calledWith(validUUId)
      .mockResolvedValue(null);

    const result = await findServiceUseCase.execute(validUUId);

    expect(result).toMatchObject({
      ...service,
      averageExecutionTimeMs: null,
    });
    expect(serviceRepository.getAverageExecutionTimeMs).toHaveBeenCalledWith(
      validUUId,
    );
  });

  test('should return service with averageExecutionTimeMs calculated from multiple items', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440002';
    const service = makeService({ id: validUUId });

    serviceRepository.findById.calledWith(validUUId).mockResolvedValue(service);
    serviceRepository.getAverageExecutionTimeMs
      .calledWith(validUUId)
      .mockResolvedValue(7500);

    const result = await findServiceUseCase.execute(validUUId);

    expect(result).toMatchObject({
      ...service,
      averageExecutionTimeMs: 7500,
    });
    expect(serviceRepository.getAverageExecutionTimeMs).toHaveBeenCalledWith(
      validUUId,
    );
  });
});
