import { AutoPartPresenter } from '@/adapters/output/auto-part/auto-part-presenter';
import type { UpdateAutoPartUseCase } from '@/application/use-cases/auto-part/update';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import type { Context } from 'elysia';
import { UpdateAutoPartInput } from './update';

describe('update auto part input', () => {
  let updateAutoPartUseCase: MockProxy<UpdateAutoPartUseCase>;
  let updateAutoPartInput: UpdateAutoPartInput;

  beforeEach(() => {
    updateAutoPartUseCase = mock();
    updateAutoPartInput = new UpdateAutoPartInput(updateAutoPartUseCase);
  });

  test('should update auto part successfully', async () => {
    const autoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });

    updateAutoPartUseCase.execute.calledWith(any()).mockResolvedValue(autoPart);

    const request = {
      body: {
        name: 'Filtro de Óleo Atualizado',
        description: 'Descrição atualizada',
        price: 2000,
        stock: 15,
      },
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    } as unknown as Context;

    const result = await updateAutoPartInput.execute(request);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(AutoPartPresenter.toHttp(autoPart))),
    );
    expect(updateAutoPartUseCase.execute).toHaveBeenCalledWith({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Filtro de Óleo Atualizado',
      description: 'Descrição atualizada',
      price: 2000,
      stock: 15,
    });
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      body: {
        name: '',
        description: 'Descrição atualizada',
        price: -100,
        stock: -5,
      },
      params: { id: 'invalid-uuid' },
    } as unknown as Context;

    const result = await updateAutoPartInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(updateAutoPartUseCase.execute).not.toHaveBeenCalled();
  });
});
