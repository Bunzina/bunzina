import type { ListServicesUseCase } from '@/application/use-cases/service/list';
import { makeService } from '@/test/factories/make-service';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import type { Context } from 'elysia';
import { ListServicesInput } from './list';

describe('list services input', () => {
  let listServicesUseCase: MockProxy<ListServicesUseCase>;
  let listServicesInput: ListServicesInput;

  beforeEach(() => {
    listServicesUseCase = mock();
    listServicesInput = new ListServicesInput(listServicesUseCase);
  });

  test('should list services with required pagination', async () => {
    const service1 = makeService({ id: 'service-1' });
    const service2 = makeService({ id: 'service-2' });

    listServicesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [service1, service2],
    });

    const request = {
      query: { page: '1', limit: '20' },
    } as unknown as Context;

    const result = await listServicesInput.execute(request);

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        data: [
          expect.objectContaining({ id: 'service-1', name: service1.name }),
          expect.objectContaining({ id: 'service-2', name: service2.name }),
        ],
        pagination: {
          page: 1,
          limit: 20,
        },
      }),
    );
  });

  test('should validate and use filter by name', async () => {
    const service = makeService({ id: 'service-1', name: 'Oil Change' });

    listServicesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [service],
    });

    const request = {
      query: { page: '1', limit: '10', name: 'Oil' },
    } as unknown as Context;

    const result = await listServicesInput.execute(request);

    expect(result.status).toBe(200);
    expect(listServicesUseCase.execute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: { name: 'Oil' },
    });
  });

  test('should return 400 when page is invalid', async () => {
    const request = {
      query: { page: '0', limit: '10' },
    } as unknown as Context;

    const result = await listServicesInput.execute(request);
    const json = await result.json();

    expect(result.status).toBe(400);
    expect(json).toEqual({
      reason: 'Invalid data in request',
      invalidParams: expect.any(Array),
    });
  });
});
