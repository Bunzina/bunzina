import type { StockMovementRepository } from '@/domain/auto-part/repositories/stock-movement-repository';
import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { makeStockMovement } from '@/test/factories/make-stock-movement';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import { CreateStockMovementUseCase } from './create-stock-movement';

describe('create stock movement use case', () => {
  let stockMovementRepository: MockProxy<StockMovementRepository>;
  let createStockMovementUseCase: CreateStockMovementUseCase;

  beforeEach(() => {
    stockMovementRepository = mock();
    createStockMovementUseCase = new CreateStockMovementUseCase(
      stockMovementRepository,
    );
  });

  test('should create an IN stock movement from positive difference', async () => {
    const existingAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
      stock: 10,
    });
    const updatedAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
      stock: 15,
    });

    stockMovementRepository.create
      .calledWith(any())
      .mockResolvedValue(makeStockMovement());

    const result = await createStockMovementUseCase.execute({
      existingAutoPart,
      updatedAutoPart,
    });

    expect(result?.autoPartId).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(result?.quantity).toBe(5);
    expect(result?.type).toBe(StockMovementType.IN);
    expect(stockMovementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        autoPartId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 5,
        type: StockMovementType.IN,
      }),
    );
  });

  test('should create stock movement when difference is negative', async () => {
    const existingAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
      stock: 10,
    });
    const updatedAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
      stock: 7,
    });

    stockMovementRepository.create
      .calledWith(any())
      .mockResolvedValue(makeStockMovement());

    const result = await createStockMovementUseCase.execute({
      existingAutoPart,
      updatedAutoPart,
    });

    expect(result?.quantity).toBe(-3);
    expect(result?.type).toBe(StockMovementType.OUT);
    expect(stockMovementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        autoPartId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: -3,
        type: StockMovementType.OUT,
      }),
    );
  });

  test('should return undefined when difference is zero', async () => {
    const existingAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
      stock: 10,
    });
    const updatedAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
      stock: 10,
    });

    const result = await createStockMovementUseCase.execute({
      existingAutoPart,
      updatedAutoPart,
    });

    expect(result).toBeUndefined();
    expect(stockMovementRepository.create).not.toHaveBeenCalled();
  });

  test('should create OUT stock movement when updated stock is negative', async () => {
    const existingAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
      stock: 2,
    });
    const updatedAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440001',
      stock: -1,
    });

    stockMovementRepository.create
      .calledWith(any())
      .mockResolvedValue(makeStockMovement());

    const result = await createStockMovementUseCase.execute({
      existingAutoPart,
      updatedAutoPart,
    });

    expect(result?.quantity).toBe(-3);
    expect(result?.type).toBe(StockMovementType.OUT);
    expect(stockMovementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        autoPartId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: -3,
        type: StockMovementType.OUT,
      }),
    );
  });
});
