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

    const result = await findServiceUseCase.execute(validUUId);

    expect(result).toMatchObject(service);
    expect(serviceRepository.findById).toHaveBeenCalledWith(validUUId);
  });

  test('should throw an error if service is not found', async () => {
    const serviceId = 'non-existing-id';

    serviceRepository.findById.calledWith(serviceId).mockResolvedValue(null);

    await expect(findServiceUseCase.execute(serviceId)).rejects.toThrow(
      'Service not found',
    );
    expect(serviceRepository.findById).toHaveBeenCalledWith(serviceId);
  });
});
