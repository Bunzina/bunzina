import type { DeleteCustomerUseCase } from '@/application/use-cases/customer/delete';
import { makeCustomer } from '@/test/factories/make-customer';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { DeleteCustomerInput } from './delete';

describe('delete customer input', () => {
  let deleteCustomerUseCase: MockProxy<DeleteCustomerUseCase>;
  let deleteCustomerInput: DeleteCustomerInput;

  beforeEach(() => {
    deleteCustomerUseCase = mock();
    deleteCustomerInput = new DeleteCustomerInput(deleteCustomerUseCase);
  });

  test('should delete a customer', async () => {
    const customer = makeCustomer();

    deleteCustomerUseCase.execute.calledWith(any()).mockResolvedValue(undefined);

    const request = {
      params: { documentNumber: customer.document.value },
    } as unknown as Context;

    const result = await deleteCustomerInput.execute(request);

    expect(result.status).toBe(204);
    expect(deleteCustomerUseCase.execute).toHaveBeenCalledWith({
      documentNumber: customer.document.value,
    });
  });

  test('should return 500 if use case throws', async () => {
    deleteCustomerUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('unexpected error'));

    const request = {
      params: { documentNumber: '12345678909' },
    } as unknown as Context;

    const result = await deleteCustomerInput.execute(request);

    expect(result.status).toBe(500);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({ error: 'Failed to delete customer' });
  });

  test('should return 400 if validation fails', async () => {
    const request = {
      params: { documentNumber: '77777777777' },
    } as unknown as Context;

    const result = await deleteCustomerInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({ reason: 'Invalid data in request' });
    expect(deleteCustomerUseCase.execute).not.toHaveBeenCalled();
  });
});
