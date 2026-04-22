import type { IServiceRepository } from '@/domain/service/repositories/service-repository';
import { mock, type MockProxy } from 'bun-mock-extended';
import { DeleteServiceUseCase } from './delete';

describe('Delete Service Use Case', () => {
  let serviceRepository: MockProxy<IServiceRepository>;
  let deleteServiceUseCase: DeleteServiceUseCase;

  beforeEach(() => {
    serviceRepository = mock<IServiceRepository>();
    deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository);
  });

  test('should delete a service', async () => {
    const serviceId = '123e4567-e89b-12d3-a456-426614174000';

    serviceRepository.findById.calledWith(serviceId).mockResolvedValue({
      id: serviceId,
      name: 'Oil Change',
      description: 'Complete oil change service',
      price: { value: 100 },
      durationInMinutes: 60,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await deleteServiceUseCase.execute({ id: serviceId });

    expect(serviceRepository.findById).toHaveBeenCalledWith(serviceId);
    expect(serviceRepository.delete).toHaveBeenCalledWith(serviceId);
  });

  test('should throw NotFoundError if service does not exist', async () => {
    const serviceId = '123e4567-e89b-12d3-a456-426614174000';

    serviceRepository.findById.calledWith(serviceId).mockResolvedValue(null);

    await expect(
      deleteServiceUseCase.execute({ id: serviceId }),
    ).rejects.toThrow('Service not found');
    expect(serviceRepository.findById).toHaveBeenCalledWith(serviceId);
    expect(serviceRepository.delete).not.toHaveBeenCalled();
  });
});
