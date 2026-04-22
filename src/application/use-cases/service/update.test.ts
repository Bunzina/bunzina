import type { IServiceRepository } from '@/domain/service/repositories/service-repository';
import { makeService } from '@/test/factories/make-service';
import { mock, type MockProxy } from 'bun-mock-extended';
import { UpdateServiceUseCase } from './update';

describe('Update Service Use Case', () => {
  let serviceRepository: MockProxy<IServiceRepository>;
  let updateServiceUseCase: UpdateServiceUseCase;

  beforeEach(() => {
    serviceRepository = mock();
    updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
  });

  test('should update a service', async () => {
    const input = {
      id: 'service-id',
      name: 'Updated Service Name',
      description: 'Updated Service Description',
      price: 150,
      durationInMinutes: 90,
      isActive: false,
    };
    const existingService = makeService({ id: input.id });
    serviceRepository.findById
      .calledWith(input.id)
      .mockResolvedValue(existingService);

    const result = await updateServiceUseCase.execute(input);

    expect(result).toMatchObject({
      id: existingService.id,
      name: 'Updated Service Name',
      description: 'Updated Service Description',
      price: { value: 150 },
      durationInMinutes: 90,
      isActive: false,
      createdAt: existingService.createdAt,
      updatedAt: expect.any(Date),
    });
    expect(serviceRepository.update).toHaveBeenCalledWith(result);
  });

  test('should throw NotFoundError if service does not exist', async () => {
    const input = {
      id: 'non-existent-service-id',
      name: 'Updated Service Name',
      description: 'Updated Service Description',
      price: 150,
      durationInMinutes: 90,
      isActive: false,
    };
    serviceRepository.findById.calledWith(input.id).mockResolvedValue(null);

    await expect(updateServiceUseCase.execute(input)).rejects.toThrow(
      'Service not found for update',
    );
  });
});
