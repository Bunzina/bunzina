import { ServiceOrderPublicPresenter } from '@/adapters/output/service-order/service-order-public-presenter';
import type { FindServiceOrdersByCustomerUseCase } from '@/application/use-cases/service-order/find-by-customer';
import { makeCustomer } from '@/test/factories/make-customer';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { FindServiceOrdersByCustomerInput } from './find-by-customer.ts';

describe('find service orders by customer input', () => {
  let findServiceOrdersByCustomerUseCase: MockProxy<FindServiceOrdersByCustomerUseCase>;
  let findServiceOrdersByCustomerInput: FindServiceOrdersByCustomerInput;

  beforeEach(() => {
    findServiceOrdersByCustomerUseCase = mock();
    findServiceOrdersByCustomerInput = new FindServiceOrdersByCustomerInput(
      findServiceOrdersByCustomerUseCase,
    );
  });

  test('should find service orders for a customer', async () => {
    const customer = makeCustomer();
    const serviceOrder = makeServiceOrder({ customerId: customer.id });

    findServiceOrdersByCustomerUseCase.execute
      .calledWith(any())
      .mockResolvedValue([serviceOrder]);

    const request = {
      params: { documentNumber: customer.document.value },
    } as unknown as Context;

    const result = await findServiceOrdersByCustomerInput.execute(request);

    expect(result.status).toBe(StatusCodes.OK);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(
        JSON.stringify([ServiceOrderPublicPresenter.toHttp(serviceOrder)]),
      ),
    );
    expect(findServiceOrdersByCustomerUseCase.execute).toHaveBeenCalledWith({
      documentNumber: customer.document.value,
    });
  });

  test('should return 400 when document number is invalid', async () => {
    const request = {
      params: { documentNumber: 'invalid-document' },
    } as unknown as Context;

    const result = await findServiceOrdersByCustomerInput.execute(request);

    expect(result.status).toBe(StatusCodes.BAD_REQUEST);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      reason: 'Invalid data in request',
      invalidParams: expect.any(Array),
    });
    expect(findServiceOrdersByCustomerUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    findServiceOrdersByCustomerUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('db error'));

    const request = {
      params: { documentNumber: '12345678909' },
    } as unknown as Context;

    const result = await findServiceOrdersByCustomerInput.execute(request);

    expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      error: 'Failed to find service orders for customer',
    });
    expect(findServiceOrdersByCustomerUseCase.execute).toHaveBeenCalledWith({
      documentNumber: '12345678909',
    });
  });
});
