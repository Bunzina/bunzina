import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { mock, type MockProxy } from 'bun-mock-extended';
import { FindAutoPartByIdUseCase } from './find-by-id';

describe('find auto part by id use case', () => {
  let autoPartRepository: MockProxy<AutoPartRepository>;
  let findAutoPartByIdUseCase: FindAutoPartByIdUseCase;

  beforeEach(() => {
    autoPartRepository = mock();
    findAutoPartByIdUseCase = new FindAutoPartByIdUseCase(autoPartRepository);
  });

  test('should find an auto part by id', async () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    const mockAutoPart = makeAutoPart({ id: validUUID });

    autoPartRepository.findById
      .calledWith(validUUID)
      .mockResolvedValue(mockAutoPart);

    const result = await findAutoPartByIdUseCase.execute({ id: validUUID });

    expect(result).toEqual(mockAutoPart);
    expect(autoPartRepository.findById).toHaveBeenCalledWith(validUUID);
  });

  test('should throw NotFoundError if auto part is not found', async () => {
    const input = { id: 'non-existent-id' };

    autoPartRepository.findById.calledWith(input.id).mockResolvedValue(null);

    await expect(findAutoPartByIdUseCase.execute(input)).rejects.toThrow(
      'Auto part not found',
    );
    expect(autoPartRepository.findById).toHaveBeenCalledWith(input.id);
  });
});
