import type { ServiceRepository } from '@/domain/service/repositories/service-repository';
import { makeService } from '@/test/factories/make-service';
import { mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import { ListServicesUseCase } from './list';

describe('list services use case', () => {
  let serviceRepository: MockProxy<ServiceRepository>;
  let listServicesUseCase: ListServicesUseCase;

  beforeEach(() => {
    serviceRepository = mock();
    listServicesUseCase = new ListServicesUseCase(serviceRepository);
  });

  test('should list services with pagination', async () => {
    const service1 = makeService({ id: 'service-1' });
    const service2 = makeService({ id: 'service-2' });

    serviceRepository.findByParams.mockResolvedValue([service1, service2]);

    const result = await listServicesUseCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.data).toEqual([service1, service2]);
    expect(serviceRepository.findByParams).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  test('should list services filtered by name', async () => {
    const service = makeService({ id: 'service-1', name: 'Oil Change' });

    serviceRepository.findByParams.mockResolvedValue([service]);

    const result = await listServicesUseCase.execute({
      page: 1,
      limit: 10,
      filters: { name: 'Oil' },
    });

    expect(result.data).toEqual([service]);
    expect(serviceRepository.findByParams).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: { name: 'Oil' },
    });
  });
});
