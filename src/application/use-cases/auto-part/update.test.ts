import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import type { StockMovementRepository } from '@/domain/auto-part/repositories/stock-movement-repository';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { makeStockMovement } from '@/test/factories/make-stock-movement';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import { NotFoundError, BadRequestError } from '@lucas-pmelo/handlers';
import { UpdateAutoPartUseCase } from './update';
import { Price } from '@/domain/core/value-objects/price';
import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';

describe('update auto part use case', () => {
  let autoPartRepository: MockProxy<AutoPartRepository>;
  let stockMovementRepository: MockProxy<StockMovementRepository>;
  let updateAutoPartUseCase: UpdateAutoPartUseCase;

  beforeEach(() => {
    autoPartRepository = mock();
    stockMovementRepository = mock();
    updateAutoPartUseCase = new UpdateAutoPartUseCase(
      autoPartRepository,
      stockMovementRepository,
    );
  });

  test('should update an existing auto part', async () => {
    const existingAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Filtro Antigo',
      description: 'Descrição antiga',
      price: new Price(1000),
      stock: 5,
    });

    autoPartRepository.findById
      .calledWith(any())
      .mockResolvedValue(existingAutoPart);
    autoPartRepository.update
      .calledWith(any())
      .mockResolvedValue(existingAutoPart);
    stockMovementRepository.create
      .calledWith(any())
      .mockResolvedValue(makeStockMovement());

    const result = await updateAutoPartUseCase.execute({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Filtro Novo',
      description: 'Descrição atualizada',
      price: 1500,
      stock: 10,
    });

    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.name).toBe('Filtro Novo');
    expect(result.description).toBe('Descrição atualizada');
    expect(result.price.value).toBe(1500);
    expect(result.stock).toBe(10);
    expect(autoPartRepository.findById).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    expect(autoPartRepository.update).toHaveBeenCalled();
    expect(stockMovementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        autoPartId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 5,
        type: StockMovementType.IN,
      }),
    );
  });

  test('should throw ValidationError when stock difference is negative', async () => {
    const existingAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440000',
      stock: 10,
    });

    autoPartRepository.findById
      .calledWith(any())
      .mockResolvedValue(existingAutoPart);
    autoPartRepository.update
      .calledWith(any())
      .mockResolvedValue(existingAutoPart);
    expect(
      updateAutoPartUseCase.execute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: existingAutoPart.name,
        description: existingAutoPart.description,
        price: existingAutoPart.price.value,
        stock: 4,
      }),
    ).rejects.toThrow(BadRequestError);

    expect(autoPartRepository.update).not.toHaveBeenCalled();
    expect(stockMovementRepository.create).not.toHaveBeenCalled();
  });

  test('should not create stock movement when stock does not change', async () => {
    const existingAutoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440000',
      stock: 10,
    });

    autoPartRepository.findById
      .calledWith(any())
      .mockResolvedValue(existingAutoPart);
    autoPartRepository.update
      .calledWith(any())
      .mockResolvedValue(existingAutoPart);

    await updateAutoPartUseCase.execute({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: existingAutoPart.name,
      description: existingAutoPart.description,
      price: existingAutoPart.price.value,
      stock: 10,
    });

    expect(stockMovementRepository.create).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when auto part does not exist', async () => {
    autoPartRepository.findById.calledWith(any()).mockResolvedValue(null);

    expect(
      updateAutoPartUseCase.execute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Filtro Novo',
        description: 'Descrição atualizada',
        price: 1500,
        stock: 10,
      }),
    ).rejects.toThrow(NotFoundError);

    expect(stockMovementRepository.create).not.toHaveBeenCalled();
  });
});
