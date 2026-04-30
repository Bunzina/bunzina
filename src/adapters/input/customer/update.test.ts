import { CustomerPresenter } from '@/adapters/output/customer/customer-presenter';
import type { UpdateCustomerUseCase } from '@/application/use-cases/customer/update';
import { makeCustomer } from '@/test/factories/make-customer';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { UpdateCustomerInput } from './update';

describe('update customer input', () => {
  let updateCustomerUseCase: MockProxy<UpdateCustomerUseCase>;
  let updateCustomerInput: UpdateCustomerInput;

  beforeEach(() => {
    updateCustomerUseCase = mock();
    updateCustomerInput = new UpdateCustomerInput(updateCustomerUseCase);
  });

  test('should update a customer', async () => {
    const customer = makeCustomer({ name: 'Jane Doe' });

    updateCustomerUseCase.execute.calledWith(any()).mockResolvedValue(customer);

    const request = {
      params: { documentNumber: '12345678909' },
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+9876543210',
        address: {
          street: '456 Oak Ave',
          number: '789',
          neighborhood: 'Uptown',
          city: 'Othertown',
          state: 'NY',
          zipCode: '67890',
        },
      },
    } as unknown as Context;

    const result = await updateCustomerInput.execute(request);

    expect(result.status).toBe(StatusCodes.OK);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(CustomerPresenter.toHttp(customer))),
    );

    expect(updateCustomerUseCase.execute).toHaveBeenCalledWith({
      documentNumber: '12345678909',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+9876543210',
      address: {
        street: '456 Oak Ave',
        number: '789',
        neighborhood: 'Uptown',
        city: 'Othertown',
        state: 'NY',
        zipCode: '67890',
      },
    });
  });

  test('should return 500 if use case throws', async () => {
    const request = {
      params: { documentNumber: '12345678909' },
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+9876543210',
        address: {
          street: '456 Oak Ave',
          number: '789',
          neighborhood: 'Uptown',
          city: 'Othertown',
          state: 'NY',
          zipCode: '67890',
        },
      },
    } as unknown as Context;

    const result = await updateCustomerInput.execute(request);

    expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({ error: 'Failed to update customer' });
  });

  test('should return 400 if validation fails', async () => {
    const request = {
      params: { documentNumber: '77777777777' },
      body: {
        name: 'Jane Doe',
        email: 'invalid-email',
        phone: '+9876543210',
        address: {
          street: '456 Oak Ave',
          number: '789',
          neighborhood: 'Uptown',
          city: 'Othertown',
          state: 'NY',
          zipCode: '67890',
        },
      },
    } as unknown as Context;

    const result = await updateCustomerInput.execute(request);

    expect(result.status).toBe(StatusCodes.BAD_REQUEST);
    expect(await result.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(updateCustomerUseCase.execute).not.toHaveBeenCalled();
  });
});
