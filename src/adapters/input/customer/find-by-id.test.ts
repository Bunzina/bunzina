import type { FindCustomerByIdUseCase } from '@/application/use-cases/customer/find-by-id';
import { makeCustomer } from '@/test/factories/make-customer';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, test } from 'bun:test';
import { FindCustomerByIdInput } from './find-by-id';

describe('find customer by id input', () => {
  let findCustomerByIdUseCase: MockProxy<FindCustomerByIdUseCase>;
  let findCustomerByIdInput: FindCustomerByIdInput;

  beforeEach(() => {
    findCustomerByIdUseCase = mock();
    findCustomerByIdInput = new FindCustomerByIdInput(findCustomerByIdUseCase);
  });

  test('returns the complete customer response for a valid UUID', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const customer = makeCustomer({
      id,
      createdAt: new Date('2025-06-15T12:00:00.000Z'),
      updatedAt: new Date('2025-06-16T12:00:00.000Z'),
    });
    findCustomerByIdUseCase.execute
      .calledWith(any())
      .mockResolvedValue(customer);

    const request = { params: { id } } as unknown as Context;
    const result = await findCustomerByIdInput.execute(request);

    expect(result.status).toBe(StatusCodes.OK);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      id,
      name: 'John Doe',
      document: '12345678909',
      documentKind: 'CPF',
      email: 'lucas.coda.fofo@gmail.com',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        number: '456',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        neighborhood: 'Downtown',
        complement: 'Apt 789',
      },
      createdAt: '2025-06-15',
      updatedAt: '2025-06-16',
    });
    expect(findCustomerByIdUseCase.execute).toHaveBeenCalledWith({ id });
  });

  test('returns a complete validation error for an invalid UUID', async () => {
    const request = { params: { id: 'not-a-uuid' } } as unknown as Context;

    const result = await findCustomerByIdInput.execute(request);

    expect(result.status).toBe(StatusCodes.BAD_REQUEST);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      reason: 'Invalid data in request',
      invalidParams: [
        {
          name: 'id',
          reason: 'Customer ID must be a valid UUID',
          value: 'not-a-uuid',
        },
      ],
    });
    expect(findCustomerByIdUseCase.execute).not.toHaveBeenCalled();
  });

  test('returns the complete error response when the use case fails', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    findCustomerByIdUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('database error'));

    const request = { params: { id } } as unknown as Context;
    const result = await findCustomerByIdInput.execute(request);

    expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      error: 'Failed to find customer by id',
    });
    expect(findCustomerByIdUseCase.execute).toHaveBeenCalledWith({ id });
  });
});
