import type { ServiceRepository } from '@/domain/service/repositories/service-repository';
import { makeService } from '@/test/factories/make-service';
import { mock, type MockProxy } from 'bun-mock-extended';
import { FindServiceByIdUseCase } from './find-by-id';

describe('find service by id use case', () => {
  let serviceRepository: MockProxy<ServiceRepository>;
  let findServiceByIdUseCase: FindServiceByIdUseCase;

  beforeEach(() => {
    serviceRepository = mock();
    findServiceByIdUseCase = new FindServiceByIdUseCase(serviceRepository);
  });

  test('should find a service by id', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const service = makeService({ id });

    serviceRepository.findById.calledWith(id).mockResolvedValue(service);

    const result = await findServiceByIdUseCase.execute({ id });

    expect(result).toBe(service);
    expect(result.averageExecutionTimeMs).toBeUndefined();
    expect(serviceRepository.findById).toHaveBeenCalledWith(id);
  });

  test('should calculate average execution time when service has completions', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const service = makeService({
      id,
      completedCount: 3,
      totalExecutionTimeMs: 10000,
    });

    serviceRepository.findById.calledWith(id).mockResolvedValue(service);

    const result = await findServiceByIdUseCase.execute({ id });

    expect(result.averageExecutionTimeMs).toBe(3333);
  });

  test('should throw NotFoundError if service is not found', async () => {
    const id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

    serviceRepository.findById.calledWith(id).mockResolvedValue(null);

    await expect(findServiceByIdUseCase.execute({ id })).rejects.toThrow(
      'Service not found',
    );
    expect(serviceRepository.findById).toHaveBeenCalledWith(id);
  });
});
