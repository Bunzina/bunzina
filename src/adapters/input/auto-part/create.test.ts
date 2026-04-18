import { AutoPartPresenter } from '@/adapters/output/auto-part/auto-part-presenter';
import type { CreateAutoPartUseCase } from '@/application/use-cases/auto-part/create';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { CreateAutoPartInput } from './create';

describe('create auto-part input', () => {
  let createAutoPartUseCase: MockProxy<CreateAutoPartUseCase>;
  let createAutoPartInput: CreateAutoPartInput;

  beforeEach(() => {
    createAutoPartUseCase = mock();
    createAutoPartInput = new CreateAutoPartInput(createAutoPartUseCase);
  });

  test('should create an auto-part', async () => {
    const autoPart = makeAutoPart();

    createAutoPartUseCase.execute.calledWith(any()).mockResolvedValue(autoPart);

    const request = {
      body: {
        name: 'Filtro de Óleo',
        description: 'Filtro para óleo do motor',
        price: 4500,
        stock: 10,
      },
    } as Context;

    const result = await createAutoPartInput.execute(request);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual(
      JSON.parse(JSON.stringify(AutoPartPresenter.toHttp(autoPart))),
    );

    expect(createAutoPartUseCase.execute).toHaveBeenCalledWith({
      name: 'Filtro de Óleo',
      description: 'Filtro para óleo do motor',
      price: 4500,
      stock: 10,
    });
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      body: {
        description: 'Filtro de ar para motor',
        price: 3000,
        stock: 20,
      },
    } as Context;

    const result = await createAutoPartInput.execute(request);

    expect(result?.status).toBe(400);
  });

  test('should return 400 when price is negative', async () => {
    const request = {
      body: {
        name: 'Filtro de Ar',
        description: 'Filtro de ar para motor',
        price: -500,
        stock: 20,
      },
    } as Context;

    const result = await createAutoPartInput.execute(request);

    expect(result?.status).toBe(400);
  });

  test('should return 400 when stock is not an integer', async () => {
    const request = {
      body: {
        name: 'Filtro de Ar',
        description: 'Filtro de ar para motor',
        price: 3000,
        stock: 20.5,
      },
    } as Context;

    const result = await createAutoPartInput.execute(request);

    expect(result?.status).toBe(400);
  });
});
