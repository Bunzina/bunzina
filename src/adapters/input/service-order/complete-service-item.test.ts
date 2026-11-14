import type { CompleteServiceItemUseCase } from '@/application/use-cases/service-order/complete-service-item';
import { makeServiceItem } from '@/test/factories/make-service-item';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test } from 'bun:test';
import type { Context } from 'elysia';
import { CompleteServiceItemInput } from './complete-service-item';

describe('complete service item input', () => {
  test('should complete a service item', async () => {
    const useCase: MockProxy<CompleteServiceItemUseCase> = mock();
    const item = makeServiceItem();
    useCase.execute.calledWith(any()).mockResolvedValue(item);

    const result = await new CompleteServiceItemInput(useCase).execute({
      params: { id: item.id },
    } as unknown as Context);

    expect(result.status).toBe(200);
    expect(await result.json()).toMatchObject({ id: item.id });
    expect(useCase.execute).toHaveBeenCalledWith({ id: item.id });
  });

  test('should return 400 when the id is invalid', async () => {
    const useCase: MockProxy<CompleteServiceItemUseCase> = mock();

    const result = await new CompleteServiceItemInput(useCase).execute({
      params: { id: 'invalid-id' },
    } as unknown as Context);

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({
      reason: 'Invalid data in request',
      invalidParams: expect.any(Array),
    });
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when the use case fails', async () => {
    const useCase: MockProxy<CompleteServiceItemUseCase> = mock();
    useCase.execute.calledWith(any()).mockRejectedValue(new Error('database'));

    const result = await new CompleteServiceItemInput(useCase).execute({
      params: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
    } as unknown as Context);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({
      error: 'Failed to complete service item',
    });
  });
});
