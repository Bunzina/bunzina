import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import type { StockMovementRepository } from '@/domain/auto-part/repositories/stock-movement-repository';
import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { makeStockMovement } from '@/test/factories/make-stock-movement';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import { BadRequestError, NotFoundError } from '@lucas-pmelo/handlers';
import { RegisterStockMovementUseCase } from './register-stock-movement';

describe('register stock movement use case', () => {
  let autoPartRepository: MockProxy<AutoPartRepository>;
  let stockMovementRepository: MockProxy<StockMovementRepository>;
  let registerStockMovementUseCase: RegisterStockMovementUseCase;

  beforeEach(() => {
    autoPartRepository = mock();
    stockMovementRepository = mock();
    registerStockMovementUseCase = new RegisterStockMovementUseCase(
      autoPartRepository,
      stockMovementRepository,
    );
  });

  test('should register an IN stock movement', async () => {
    const autoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440000',
      stock: 10,
    });

    autoPartRepository.findById.calledWith(any()).mockResolvedValue(autoPart);
    autoPartRepository.update.calledWith(any()).mockResolvedValue(autoPart);
    stockMovementRepository.create
      .calledWith(any())
      .mockResolvedValue(makeStockMovement());

    const result = await registerStockMovementUseCase.execute({
      id: autoPart.id!,
      quantity: 5,
      type: StockMovementType.IN,
    });

    expect(result.stock).toBe(15);
    expect(autoPartRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: autoPart.id,
        stock: 15,
      }),
    );
    expect(stockMovementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        autoPartId: autoPart.id,
        quantity: 5,
        type: StockMovementType.IN,
      }),
    );
  });

  test('should register an OUT stock movement', async () => {
    const autoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440000',
      stock: 10,
    });

    autoPartRepository.findById.calledWith(any()).mockResolvedValue(autoPart);
    autoPartRepository.update.calledWith(any()).mockResolvedValue(autoPart);
    stockMovementRepository.create
      .calledWith(any())
      .mockResolvedValue(makeStockMovement());

    const result = await registerStockMovementUseCase.execute({
      id: autoPart.id!,
      quantity: 4,
      type: StockMovementType.OUT,
    });

    expect(result.stock).toBe(6);
    expect(stockMovementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        autoPartId: autoPart.id,
        quantity: 4,
        type: StockMovementType.OUT,
      }),
    );
  });

  test('should throw BadRequestError when stock would become negative', async () => {
    const autoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440000',
      stock: 3,
    });

    autoPartRepository.findById.calledWith(any()).mockResolvedValue(autoPart);

    expect(
      registerStockMovementUseCase.execute({
        id: autoPart.id!,
        quantity: 4,
        type: StockMovementType.OUT,
      }),
    ).rejects.toThrow(BadRequestError);

    expect(autoPartRepository.update).not.toHaveBeenCalled();
    expect(stockMovementRepository.create).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when auto part does not exist', async () => {
    autoPartRepository.findById.calledWith(any()).mockResolvedValue(null);

    expect(
      registerStockMovementUseCase.execute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 2,
        type: StockMovementType.IN,
      }),
    ).rejects.toThrow(NotFoundError);

    expect(autoPartRepository.update).not.toHaveBeenCalled();
    expect(stockMovementRepository.create).not.toHaveBeenCalled();
  });
});
