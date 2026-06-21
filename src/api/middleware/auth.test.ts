import { signJwt } from '@/infrastructure/services/jwt';
import type { Context } from 'elysia';
import { authMiddleware } from './auth';

describe('auth middleware', () => {
  test('should return 401 when no authorization header', async () => {
    const context = {
      request: {
        headers: new Headers(),
      },
      store: {},
    } as unknown as Context;

    const result = await authMiddleware(context);

    expect(result?.status).toBe(401);
    expect(await result?.json()).toEqual({
      reason: 'Missing or invalid authorization header',
    });
  });

  test('should pass when api key is present but authorization is missing', async () => {
    const context = {
      request: {
        headers: new Headers({ 'Api-Key': 'test-api-key' }),
      },
      store: {},
    } as unknown as Context;

    const result = await authMiddleware(context);

    expect(result).toBeUndefined();
  });

  test('should pass when api key is present and authorization is invalid', async () => {
    const context = {
      request: {
        headers: new Headers({
          Authorization: 'Basic abc',
          'Api-Key': 'test-api-key',
        }),
      },
      store: {},
    } as unknown as Context;

    const result = await authMiddleware(context);

    expect(result).toBeUndefined();
  });

  test('should return 401 when authorization header does not start with Bearer', async () => {
    const context = {
      request: {
        headers: new Headers({ Authorization: 'Basic abc' }),
      },
      store: {},
    } as unknown as Context;

    const result = await authMiddleware(context);

    expect(result?.status).toBe(401);
    expect(await result?.json()).toEqual({
      reason: 'Missing or invalid authorization header',
    });
  });

  test('should return 401 when token is invalid', async () => {
    const context = {
      request: {
        headers: new Headers({ Authorization: 'Bearer invalid-token' }),
      },
      store: {},
    } as unknown as Context;

    const result = await authMiddleware(context);

    expect(result?.status).toBe(401);
    expect(await result?.json()).toEqual({
      reason: 'Invalid or expired token',
    });
  });

  test('should pass and set user in store when token is valid', async () => {
    const token = await signJwt({
      sub: '123',
      email: 'admin@bunzina.com',
      role: 'ADMIN',
    });

    const context = {
      request: {
        headers: new Headers({ Authorization: `Bearer ${token}` }),
      },
      store: {},
    } as unknown as Context;

    const result = await authMiddleware(context);

    expect(result).toBeUndefined();
    expect((context.store as Record<string, unknown>).user).toMatchObject({
      sub: '123',
      email: 'admin@bunzina.com',
      role: 'ADMIN',
    });
  });

  test('should ignore an invalid api key when authorization is valid', async () => {
    const token = await signJwt({
      sub: '123',
      email: 'admin@bunzina.com',
      role: 'ADMIN',
    });

    const context = {
      request: {
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          'Api-Key': 'invalid-api-key',
        }),
      },
      store: {},
    } as unknown as Context;

    const result = await authMiddleware(context);

    expect(result).toBeUndefined();
    expect(context.store).toEqual({});
  });
});
