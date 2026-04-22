import type { ListAutoPartsUseCase } from '@/application/use-cases/auto-part/list';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import type { Context } from 'elysia';
import { ListAutoPartsInput } from './list';

describe('list auto parts input', () => {
  let listAutoPartsUseCase: MockProxy<ListAutoPartsUseCase>;
  let listAutoPartsInput: ListAutoPartsInput;

  beforeEach(() => {
    listAutoPartsUseCase = mock();
    listAutoPartsInput = new ListAutoPartsInput(listAutoPartsUseCase);
  });

  test('should list auto parts with required pagination', async () => {
    const part1 = makeAutoPart({ id: 'auto-part-1' });
    const part2 = makeAutoPart({ id: 'auto-part-2' });

    listAutoPartsUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [part1, part2],
    });

    const request = {
      query: { page: '1', limit: '20' },
    } as unknown as Context;

    const result = await listAutoPartsInput.execute(request);

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        data: [
          expect.objectContaining({ id: 'auto-part-1', name: part1.name }),
          expect.objectContaining({ id: 'auto-part-2', name: part2.name }),
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
      query: { page: '0', limit: '200' },
    } as unknown as Context;

    const result = await listAutoPartsInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        reason: expect.any(String),
        invalidParams: expect.any(Array),
      }),
    );
  });

  test('should support lowStock filter', async () => {
    const part = makeAutoPart({ stock: 2 });

    listAutoPartsUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [part],
    });

    const request = {
      query: { page: '1', limit: '20', lowStock: 'true' },
    } as unknown as Context;

    const result = await listAutoPartsInput.execute(request);

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        data: [expect.objectContaining({ id: part.id })],
      }),
    );
  });
});
