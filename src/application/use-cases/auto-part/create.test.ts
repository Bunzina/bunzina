import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { CreateAutoPartUseCase } from './create';
import { makeAutoPart } from '@/test/factories/make-auto-part';

describe('create auto-part use case', () => {
  let autoPartRepository: MockProxy<AutoPartRepository>;
  let createAutoPartUseCase: CreateAutoPartUseCase;

  beforeEach(() => {
    autoPartRepository = mock();
    createAutoPartUseCase = new CreateAutoPartUseCase(autoPartRepository);
  });

  test('should create an auto-part', async () => {
    const input = {
      name: 'Filtro de Óleo',
      description: 'Filtro para óleo do motor',
      price: 4500,
      stock: 10,
    };

    const result = await createAutoPartUseCase.execute(input);

    expect(result).toMatchObject({
      name: 'Filtro de Óleo',
      description: 'Filtro para óleo do motor',
      price: {
        value: 4500,
      },
      stock: 10,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(String),
    });

    expect(autoPartRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Filtro de Óleo',
        description: 'Filtro para óleo do motor',
        stock: 10,
      }),
    );
  });

  test('should throw error when auto-part already exists', async () => {
    const existingAutoPart = makeAutoPart({
      name: 'Filtro de Óleo',
    });

    const input = {
      name: 'Filtro de Óleo',
      description: 'New filter',
      price: 5000,
      stock: 10,
    };

    autoPartRepository.findByName.calledWith(input.name).mockResolvedValue(existingAutoPart);

    expect(createAutoPartUseCase.execute(input)).rejects.toThrow(
      'Auto-part already exists',
    );

    expect(autoPartRepository.create).not.toHaveBeenCalled();
  });

  test('should throw error when price is negative', async () => {
    const input = {
      name: 'Invalid Auto-Part',
      description: 'With negative price',
      price: -100,
      stock: 5,
    };

    expect(createAutoPartUseCase.execute(input)).rejects.toThrow();
  });
});
