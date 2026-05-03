import { AutoPartPresenter } from '@/adapters/output/auto-part/auto-part-presenter';
import type { RegisterStockMovementUseCase } from '@/application/use-cases/auto-part/register-stock-movement';
import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import type { Context } from 'elysia';
import { RegisterStockMovementInput } from './register-stock-movement';

describe('register stock movement input', () => {
  let registerStockMovementUseCase: MockProxy<RegisterStockMovementUseCase>;
  let registerStockMovementInput: RegisterStockMovementInput;

  beforeEach(() => {
    registerStockMovementUseCase = mock();
    registerStockMovementInput = new RegisterStockMovementInput(
      registerStockMovementUseCase,
    );
  });

  test('should register stock movement successfully', async () => {
    const autoPart = makeAutoPart({
      id: '550e8400-e29b-41d4-a716-446655440000',
      stock: 15,
    });

    registerStockMovementUseCase.execute
      .calledWith(any())
      .mockResolvedValue(autoPart);

    const request = {
      body: {
        quantity: 5,
        type: StockMovementType.IN,
      },
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    } as unknown as Context;

    const result = await registerStockMovementInput.execute(request);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(AutoPartPresenter.toHttp(autoPart))),
    );
    expect(registerStockMovementUseCase.execute).toHaveBeenCalledWith({
      id: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 5,
      type: StockMovementType.IN,
    });
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      body: {
        quantity: 0,
        type: 'INVALID',
      },
      params: { id: 'invalid-uuid' },
    } as unknown as Context;

    const result = await registerStockMovementInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(registerStockMovementUseCase.execute).not.toHaveBeenCalled();
  });
});
