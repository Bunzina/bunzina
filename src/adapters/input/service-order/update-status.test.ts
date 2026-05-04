import { ServiceOrderPresenter } from '@/adapters/output/service-order/service-order-presenter';
import type { UpdateServiceOrderStatusUseCase } from '@/application/use-cases/service-order/update-status';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { UpdateServiceOrderStatusInput } from './update-status';

describe('update service order status input', () => {
  let updateServiceOrderStatusUseCase: MockProxy<UpdateServiceOrderStatusUseCase>;
  let updateServiceOrderStatusInput: UpdateServiceOrderStatusInput;

  beforeEach(() => {
    updateServiceOrderStatusUseCase = mock();
    updateServiceOrderStatusInput = new UpdateServiceOrderStatusInput(
      updateServiceOrderStatusUseCase,
    );
  });

  test('should update a service order status', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.IN_DIAGNOSTIC,
    });

    updateServiceOrderStatusUseCase.execute
      .calledWith(any())
      .mockResolvedValue(serviceOrder);

    const request = {
      params: { id },
      body: { direction: 'next' },
    } as unknown as Context;

    const result = await updateServiceOrderStatusInput.execute(request);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(ServiceOrderPresenter.toHttp(serviceOrder))),
    );
    expect(updateServiceOrderStatusUseCase.execute).toHaveBeenCalledWith({
      id,
      direction: 'next',
    });
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      params: { id: 'invalid-id' },
      body: { direction: 'next' },
    } as unknown as Context;

    const result = await updateServiceOrderStatusInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(updateServiceOrderStatusUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    updateServiceOrderStatusUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('unexpected error'));

    const request = {
      params: { id: '11111111-1111-4111-8111-111111111111' },
      body: { direction: 'next' },
    } as unknown as Context;

    const result = await updateServiceOrderStatusInput.execute(request);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({
      error: 'Failed to update service order status',
    });
  });
});
