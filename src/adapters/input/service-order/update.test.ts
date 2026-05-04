import { ServiceOrderPresenter } from '@/adapters/output/service-order/service-order-presenter';
import type { UpdateServiceOrderUseCase } from '@/application/use-cases/service-order/update';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import type { Context } from 'elysia';
import { UpdateServiceOrderInput } from './update';

describe('update service order input', () => {
  let updateServiceOrderUseCase: MockProxy<UpdateServiceOrderUseCase>;
  let updateServiceOrderInput: UpdateServiceOrderInput;

  beforeEach(() => {
    updateServiceOrderUseCase = mock();
    updateServiceOrderInput = new UpdateServiceOrderInput(
      updateServiceOrderUseCase,
    );
  });

  test('should update a service order', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const serviceOrder = makeServiceOrder({ id });

    updateServiceOrderUseCase.execute
      .calledWith(any())
      .mockResolvedValue(serviceOrder);

    const request = {
      params: { id },
      body: {
        serviceItems: [
          {
            serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            price: 120,
            description: 'Brake check',
          },
        ],
        autoPartItems: [
          {
            autoPartId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
            quantity: 2,
            unitPrice: 50,
            description: 'Brake pad',
          },
        ],
      },
    } as unknown as Context;

    const result = await updateServiceOrderInput.execute(request);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(ServiceOrderPresenter.toHttp(serviceOrder))),
    );
    expect(updateServiceOrderUseCase.execute).toHaveBeenCalledWith({
      id,
      serviceItems: [
        {
          serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          price: 120,
          description: 'Brake check',
        },
      ],
      autoPartItems: [
        {
          autoPartId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
          quantity: 2,
          unitPrice: 50,
          description: 'Brake pad',
        },
      ],
    });
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      params: { id: 'invalid-uuid' },
      body: {
        serviceItems: [],
        autoPartItems: [],
      },
    } as unknown as Context;

    const result = await updateServiceOrderInput.execute(request);

    expect(result.status).toBe(400);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      reason: 'Invalid data in request',
      invalidParams: expect.any(Array),
    });
    expect(updateServiceOrderUseCase.execute).not.toHaveBeenCalled();
  });
});
