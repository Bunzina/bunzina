import type { ListStockMovementsUseCase } from '@/application/use-cases/auto-part/list-stock-movements';
import { makeStockMovement } from '@/test/factories/make-stock-movement';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import type { Context } from 'elysia';
import { ListStockMovementsInput } from './list-stock-movements';

describe('list stock movements input', () => {
  let listStockMovementsUseCase: MockProxy<ListStockMovementsUseCase>;
  let listStockMovementsInput: ListStockMovementsInput;

  beforeEach(() => {
    listStockMovementsUseCase = mock();
    listStockMovementsInput = new ListStockMovementsInput(
      listStockMovementsUseCase,
    );
  });

  test('should list stock movements with required pagination', async () => {
    const movementA = makeStockMovement({
      id: '550e8400-e29b-41d4-a716-446655440010',
      autoPartId: '550e8400-e29b-41d4-a716-446655440001',
    });
    const movementB = makeStockMovement({
      id: '550e8400-e29b-41d4-a716-446655440011',
      autoPartId: '550e8400-e29b-41d4-a716-446655440001',
    });

    listStockMovementsUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [movementA, movementB],
    });

    const request = {
      params: { id: '550e8400-e29b-41d4-a716-446655440001' },
      query: { page: '1', limit: '20' },
    } as unknown as Context;

    const result = await listStockMovementsInput.execute(request);

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            id: '550e8400-e29b-41d4-a716-446655440010',
          }),
          expect.objectContaining({
            id: '550e8400-e29b-41d4-a716-446655440011',
          }),
        ],
        pagination: {
          page: 1,
          limit: 20,
        },
      }),
    );
  });

  test('should return 400 if pagination is invalid', async () => {
    const request = {
      params: { id: 'invalid-uuid' },
      query: { page: '0', limit: '200' },
    } as unknown as Context;

    const result = await listStockMovementsInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        reason: expect.any(String),
        invalidParams: expect.any(Array),
      }),
    );
  });
});
