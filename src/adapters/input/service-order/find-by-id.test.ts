import { ServiceOrderPresenter } from '@/adapters/output/service-order/service-order-presenter';
import type { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { FindServiceOrderByIdInput } from './find-by-id';

describe('find service order by id input', () => {
  let findServiceOrderByIdUseCase: MockProxy<FindServiceOrderByIdUseCase>;
  let findServiceOrderByIdInput: FindServiceOrderByIdInput;

  beforeEach(() => {
    findServiceOrderByIdUseCase = mock();
    findServiceOrderByIdInput = new FindServiceOrderByIdInput(
      findServiceOrderByIdUseCase,
    );
  });

  test('should find a service order', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const serviceOrder = makeServiceOrder({ id });

    findServiceOrderByIdUseCase.execute
      .calledWith(any())
      .mockResolvedValue(serviceOrder);

    const request = {
      params: { id },
    } as unknown as Context;

    const result = await findServiceOrderByIdInput.execute(request);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(ServiceOrderPresenter.toHttp(serviceOrder))),
    );
    expect(findServiceOrderByIdUseCase.execute).toHaveBeenCalledWith({ id });
  });

  test('should return 400 when id is invalid', async () => {
    const request = {
      params: { id: 'invalid-uuid' },
    } as unknown as Context;

    const result = await findServiceOrderByIdInput.execute(request);

    expect(result.status).toBe(400);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      reason: 'Invalid data in request',
      invalidParams: expect.any(Array),
    });
    expect(findServiceOrderByIdUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

    findServiceOrderByIdUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('db error'));

    const request = {
      params: { id },
    } as unknown as Context;

    const result = await findServiceOrderByIdInput.execute(request);

    expect(result.status).toBe(500);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      error: 'Failed to find service order',
    });
    expect(findServiceOrderByIdUseCase.execute).toHaveBeenCalledWith({ id });
  });
});
