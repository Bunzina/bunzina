import type { ServiceRepository } from '@/domain/service/repositories/service-repository';
import { mock, type MockProxy } from 'bun-mock-extended';
import { CreateServiceUseCase } from './create';

describe('Create Service Use Case', () => {
  const mockServiceRepository: MockProxy<ServiceRepository> = mock();

  const createServiceUseCase = new CreateServiceUseCase(mockServiceRepository);

  test('should create a service', async () => {
    const input = {
      name: 'Oil Change',
      description: 'Complete oil change service',
      price: 100,
      durationInMinutes: 60,
    };

    const result = await createServiceUseCase.execute(input);

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
    expect(mockServiceRepository.create).toHaveBeenCalledWith(result);
  });
});
