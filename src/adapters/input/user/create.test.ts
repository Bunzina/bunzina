import { UserPresenter } from '@/adapters/output/user/user-presenter';
import type { CreateUserUseCase } from '@/application/use-cases/user/create';
import { makeUser } from '@/test/factories/make-user';
import { any, mock as mockExtended, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test } from 'bun:test';
import type { Context } from 'elysia';

const mockVerifyJwt = mock(() =>
  Promise.resolve({
    sub: '1',
    document: '11144477735',
    email: 'a@b.com',
    role: 'ADMIN',
  }),
);
mock.module('@/infrastructure/services/jwt', () => ({
  verifyJwt: mockVerifyJwt,
}));

import { CreateUserInput } from './create';

describe('create user input', () => {
  let createUserUseCase: MockProxy<CreateUserUseCase>;
  let createUserInput: CreateUserInput;

  beforeEach(() => {
    createUserUseCase = mockExtended();
    createUserInput = new CreateUserInput(createUserUseCase);
  });

  test('should create a CUSTOMER user without auth', async () => {
    const user = makeUser();

    createUserUseCase.execute.calledWith(any()).mockResolvedValue(user);

    const request = {
      body: {
        name: 'John Doe',
        document: '111.444.777-35',
        email: 'john@example.com',
        password: 'password123',
        role: 'CUSTOMER',
      },
      request: { headers: new Headers() },
    } as unknown as Context;

    const result = await createUserInput.execute(request);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual(
      JSON.parse(JSON.stringify(UserPresenter.toHttp(user))),
    );
  });

  test('should create a non-CUSTOMER user with valid auth', async () => {
    const user = makeUser();

    createUserUseCase.execute.calledWith(any()).mockResolvedValue(user);

    const request = {
      body: {
        name: 'John Doe',
        document: '111.444.777-35',
        email: 'john@example.com',
        password: 'password123',
        role: 'MECHANIC',
      },
      request: {
        headers: new Headers({ Authorization: 'Bearer valid-token' }),
      },
    } as unknown as Context;

    const result = await createUserInput.execute(request);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 401 for non-CUSTOMER without auth header', async () => {
    const request = {
      body: {
        name: 'John Doe',
        document: '111.444.777-35',
        email: 'john@example.com',
        password: 'password123',
        role: 'ADMIN',
      },
      request: { headers: new Headers() },
    } as unknown as Context;

    const result = await createUserInput.execute(request);

    expect(result?.status).toBe(401);
    expect(await result?.json()).toEqual({
      reason: 'Missing or invalid authorization header',
    });
    expect(createUserUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      body: {
        name: 'John Doe',
        document: 'invalid-cpf',
        email: 'invalid-email',
        password: '123',
        role: 'INVALID',
      },
    } as unknown as Context;

    const result = await createUserInput.execute(request);

    expect(result?.status).toBe(400);
    expect(await result?.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(createUserUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    createUserUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('db error'));

    const request = {
      body: {
        name: 'John Doe',
        document: '111.444.777-35',
        email: 'john@example.com',
        password: 'password123',
        role: 'CUSTOMER',
      },
    } as unknown as Context;

    const result = await createUserInput.execute(request);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({ error: 'Failed to create user' });
  });
});
