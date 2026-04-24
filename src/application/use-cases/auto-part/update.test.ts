import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import { NotFoundError } from '@lucas-pmelo/handlers';
import { UpdateAutoPartUseCase } from './update';
import { Price } from '@/domain/core/value-objects/price';

describe('update auto part use case', () => {
  let autoPartRepository: MockProxy<AutoPartRepository>;
  let updateAutoPartUseCase: UpdateAutoPartUseCase;

  beforeEach(() => {
    autoPartRepository = mock();
    updateAutoPartUseCase = new UpdateAutoPartUseCase(autoPartRepository);
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
  });
});
