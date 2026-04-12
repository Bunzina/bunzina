import type { LoginUseCase } from '@/application/use-cases/user/login';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { LoginInput } from './login';

describe('login input', () => {
  let loginUseCase: MockProxy<LoginUseCase>;
  let loginInput: LoginInput;

  beforeEach(() => {
    loginUseCase = mock();
    loginInput = new LoginInput(loginUseCase);
  });

  test('should return 200 with token on successful login', async () => {
    loginUseCase.execute
      .calledWith(any())
      .mockResolvedValue({ token: 'jwt-token' });

    const request = {
      body: {
        email: 'admin@bunzina.com',
        password: 'password123',
      },
    } as Context;

    const result = await loginInput.execute(request);

    expect(result?.status).toBe(200);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual({ token: 'jwt-token' });

    expect(loginUseCase.execute).toHaveBeenCalledWith({
      email: 'admin@bunzina.com',
      password: 'password123',
    });
  });

  test('should return 400 when email is invalid', async () => {
    const request = {
      body: {
        email: 'invalid-email',
        password: 'password123',
      },
    } as Context;

    const result = await loginInput.execute(request);

    expect(result?.status).toBe(400);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 400 when password is empty', async () => {
    const request = {
      body: {
        email: 'admin@bunzina.com',
        password: '',
      },
    } as Context;

    const result = await loginInput.execute(request);

    expect(result?.status).toBe(400);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 500 when use case throws unexpected error', async () => {
    loginUseCase.execute.calledWith(any()).mockRejectedValue(new Error('fail'));

    const request = {
      body: {
        email: 'admin@bunzina.com',
        password: 'password123',
      },
    } as Context;

    const result = await loginInput.execute(request);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({ error: 'Failed to login' });
  });
});
