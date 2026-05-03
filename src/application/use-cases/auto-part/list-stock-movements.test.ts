import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import type { StockMovementRepository } from '@/domain/auto-part/repositories/stock-movement-repository';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { makeStockMovement } from '@/test/factories/make-stock-movement';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import { NotFoundError } from '@lucas-pmelo/handlers';
import { ListStockMovementsUseCase } from './list-stock-movements';

describe('list stock movements use case', () => {
  let autoPartRepository: MockProxy<AutoPartRepository>;
  let stockMovementRepository: MockProxy<StockMovementRepository>;
  let listStockMovementsUseCase: ListStockMovementsUseCase;

  beforeEach(() => {
    autoPartRepository = mock();
    stockMovementRepository = mock();
    listStockMovementsUseCase = new ListStockMovementsUseCase(
      autoPartRepository,
      stockMovementRepository,
    );
  });

  test('should list stock movements by auto part id', async () => {
    const autoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
    });
    const movementA = makeStockMovement({
      id: '550e8400-e29b-41d4-a716-446655440010',
      autoPartId: autoPart.id!,
    });
    const movementB = makeStockMovement({
      id: '550e8400-e29b-41d4-a716-446655440011',
      autoPartId: autoPart.id!,
    });

    autoPartRepository.findById.calledWith(any()).mockResolvedValue(autoPart);
    stockMovementRepository.findByAutoPartId
      .calledWith(any())
      .mockResolvedValue([movementA, movementB]);

    const result = await listStockMovementsUseCase.execute({
      id: autoPart.id!,
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(2);
    expect(stockMovementRepository.findByAutoPartId).toHaveBeenCalledWith({
      autoPartId: autoPart.id!,
      page: 1,
      limit: 20,
    });
  });

  test('should handle empty result', async () => {
    const autoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
    });

    autoPartRepository.findById.calledWith(any()).mockResolvedValue(autoPart);
    stockMovementRepository.findByAutoPartId
      .calledWith(any())
      .mockResolvedValue([]);

    const result = await listStockMovementsUseCase.execute({
      id: autoPart.id!,
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(0);
  });

  test('should throw NotFoundError when auto part does not exist', async () => {
    autoPartRepository.findById.calledWith(any()).mockResolvedValue(null);

    expect(
      listStockMovementsUseCase.execute({
        id: '550e8400-e29b-41d4-a716-446655440001',
        page: 1,
        limit: 20,
      }),
    ).rejects.toThrow(NotFoundError);

    expect(stockMovementRepository.findByAutoPartId).not.toHaveBeenCalled();
  });
});
