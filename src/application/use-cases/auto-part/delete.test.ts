import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { mock, type MockProxy } from 'bun-mock-extended';
import { DeleteAutoPartUseCase } from './delete';

describe('delete auto part use case', () => {
  let autoPartRepository: MockProxy<AutoPartRepository>;
  let deleteAutoPartUseCase: DeleteAutoPartUseCase;

  beforeEach(() => {
    autoPartRepository = mock();
    deleteAutoPartUseCase = new DeleteAutoPartUseCase(autoPartRepository);
  });

  test('should soft delete an auto part', async () => {
    const autoPartId = '123e4567-e89b-12d3-a456-426614174000';

    autoPartRepository.findById
      .calledWith(autoPartId)
      .mockResolvedValue(makeAutoPart({ id: autoPartId }));

    await deleteAutoPartUseCase.execute({ id: autoPartId });

    expect(autoPartRepository.findById).toHaveBeenCalledWith(autoPartId);
    expect(autoPartRepository.delete).toHaveBeenCalledWith(autoPartId);
  });

  test('should throw NotFoundError if auto part does not exist', async () => {
    const autoPartId = '123e4567-e89b-12d3-a456-426614174000';

    autoPartRepository.findById.calledWith(autoPartId).mockResolvedValue(null);

    await expect(
      deleteAutoPartUseCase.execute({ id: autoPartId }),
    ).rejects.toThrow('Auto part not found');
    expect(autoPartRepository.findById).toHaveBeenCalledWith(autoPartId);
    expect(autoPartRepository.delete).not.toHaveBeenCalled();
  });
});
