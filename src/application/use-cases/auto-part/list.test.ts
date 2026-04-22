import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import { ListAutoPartsUseCase } from './list';

describe('list auto parts use case', () => {
  let autoPartRepository: MockProxy<AutoPartRepository>;
  let listAutoPartsUseCase: ListAutoPartsUseCase;

  beforeEach(() => {
    autoPartRepository = mock();
    listAutoPartsUseCase = new ListAutoPartsUseCase(autoPartRepository);
  });

  test('should list auto parts with default pagination', async () => {
    const partA = makeAutoPart({ id: 'auto-part-1' });
    const partB = makeAutoPart({ id: 'auto-part-2' });

    autoPartRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([partA, partB]);

    const result = await listAutoPartsUseCase.execute({
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(2);
    expect(result.data[0]?.id).toBe('auto-part-1');
    expect(result.data[1]?.id).toBe('auto-part-2');
    expect(autoPartRepository.findByParams).toHaveBeenCalled();
  });

  test('should apply name filter', async () => {
    const part = makeAutoPart();

    autoPartRepository.findByParams.calledWith(any()).mockResolvedValue([part]);

    const result = await listAutoPartsUseCase.execute({
      page: 1,
      limit: 20,
      filters: {
        name: 'Filtro',
      },
    });

    expect(result.data).toHaveLength(1);
    expect(autoPartRepository.findByParams).toHaveBeenCalled();
  });

  test('should apply lowStock filter', async () => {
    const part = makeAutoPart({ stock: 2 });

    autoPartRepository.findByParams.calledWith(any()).mockResolvedValue([part]);

    const result = await listAutoPartsUseCase.execute({
      page: 1,
      limit: 20,
      filters: {
        lowStock: true,
      },
    });

    expect(result.data).toHaveLength(1);
    expect(autoPartRepository.findByParams).toHaveBeenCalled();
  });

  test('should handle empty result', async () => {
    autoPartRepository.findByParams.calledWith(any()).mockResolvedValue([]);

    const result = await listAutoPartsUseCase.execute({
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(0);
  });
});
