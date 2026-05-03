import { ServiceOrderPresenter } from '@/adapters/output/service-order/service-order-presenter';
import type { CreateServiceOrderUseCase } from '@/application/use-cases/service-order/create';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { makeQuote } from '@/test/factories/make-quote';
import { makeServiceOrderInput } from '@/test/factories/make-service-order-input';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { CreateServiceOrderInput } from './create';

describe('create service order input', () => {
  let createServiceOrderUseCase: MockProxy<CreateServiceOrderUseCase>;
  let createServiceOrderInput: CreateServiceOrderInput;

  beforeEach(() => {
    createServiceOrderUseCase = mock();
    createServiceOrderInput = new CreateServiceOrderInput(
      createServiceOrderUseCase,
    );
  });

  test('should create a service order', async () => {
    const serviceOrder = makeServiceOrder();
    const input = makeServiceOrderInput();

    createServiceOrderUseCase.execute
      .calledWith(any())
      .mockResolvedValue(serviceOrder);

    const request = {
      body: input,
    } as Context;

    const result = await createServiceOrderInput.execute(request);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual(
      JSON.parse(JSON.stringify(ServiceOrderPresenter.toHttp(serviceOrder))),
    );

    expect(createServiceOrderUseCase.execute).toHaveBeenCalledWith(input);
  });

  test('should allow creating a service order without auto parts', async () => {
    const serviceOrder = makeServiceOrder({
      autoPartItems: [],
      quote: makeQuote({ autoPartsTotal: 0 }),
    });
    const input = makeServiceOrderInput({ autoPartItems: [] });

    createServiceOrderUseCase.execute
      .calledWith(any())
      .mockResolvedValue(serviceOrder);

    const request = {
      body: input,
    } as Context;

    const result = await createServiceOrderInput.execute(request);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual(
      JSON.parse(JSON.stringify(ServiceOrderPresenter.toHttp(serviceOrder))),
    );

    expect(createServiceOrderUseCase.execute).toHaveBeenCalledWith(input);
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      body: {},
    } as Context;

    const result = await createServiceOrderInput.execute(request);

    expect(result?.status).toBe(400);
  });

  test('should return 400 when item price is negative', async () => {
    const input = makeServiceOrderInput({
      serviceItems: [
        {
          serviceId: '33333333-3333-4333-8333-333333333333',
          price: -10,
        },
      ],
    });

    const request = {
      body: input,
    } as Context;

    const result = await createServiceOrderInput.execute(request);

    expect(result?.status).toBe(400);
  });

  test('should return 400 when items are empty', async () => {
    const input = makeServiceOrderInput({
      serviceItems: [],
      autoPartItems: [],
    });

    const request = {
      body: input,
    } as Context;

    const result = await createServiceOrderInput.execute(request);

    expect(result?.status).toBe(400);
  });
});
