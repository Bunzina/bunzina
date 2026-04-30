import { CustomerPresenter } from '@/adapters/output/customer/customer-presenter';
import type { FindCustomerUseCase } from '@/application/use-cases/customer/find';
import { makeCustomer } from '@/test/factories/make-customer';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { FindCustomerInput } from './find';

describe('find customer input', () => {
  let findCustomerUseCase: MockProxy<FindCustomerUseCase>;
  let findCustomerInput: FindCustomerInput;

  beforeEach(() => {
    findCustomerUseCase = mock();
    findCustomerInput = new FindCustomerInput(findCustomerUseCase);
  });

  test('should find a customer', async () => {
    const customer = makeCustomer();

    findCustomerUseCase.execute.calledWith(any()).mockResolvedValue(customer);

    const request = {
      params: { documentNumber: customer.document.value },
    } as unknown as Context;

    const result = await findCustomerInput.execute(request);

    expect(result.status).toBe(StatusCodes.OK);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(CustomerPresenter.toHttp(customer))),
    );
    expect(findCustomerUseCase.execute).toHaveBeenCalledWith({
      documentNumber: customer.document.value,
    });
  });

  test('should return 500 if use case throws', async () => {
    const request = {
      params: { documentNumber: '12345678909' },
    } as unknown as Context;

    const result = await findCustomerInput.execute(request);

    expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({ error: 'Failed to find customer' });
    expect(findCustomerUseCase.execute).toHaveBeenCalledWith({
      documentNumber: '12345678909',
    });
  });
});
