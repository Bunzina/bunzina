import { mockFn } from 'bun-mock-extended';
import { mock, test, describe, expect } from 'bun:test';

const mockDb = mockFn<(..._args: unknown[]) => Promise<unknown[]>>();

mock.module('@/infrastructure/configs/database', () => ({
  db: mockDb,
}));

import { app } from './server';

describe('Server', () => {
  test('GET /health returns 200 and status ok', async () => {
    const response = await app.handle(new Request('http://localhost/health'));

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  test('POST /users returns 422 for invalid email payload', async () => {
    const response = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'João Silva',
          document: '111.444.777-35',
          email: 'invalid-email',
          password: 'senha123',
          role: 'CUSTOMER',
        }),
      }),
    );

    expect(response).toBeDefined();
    expect(response.status).toBe(422);
    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  test('POST /auth/login returns 400 when body is invalid', async () => {
    const response = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: 'invalid-cpf',
          password: '',
        }),
      }),
    );

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  test('GET /customers/:documentNumber returns 401 without Authorization', async () => {
    const response = await app.handle(
      new Request('http://localhost/customers/12345678901', {
        method: 'GET',
      }),
    );

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.json()).toEqual({
      reason: 'Missing or invalid authorization header',
    });
  });

  test('GET /service-orders/customer/:documentNumber is public', async () => {
    mockDb.mockResolvedValueOnce([]);

    const response = await app.handle(
      new Request('http://localhost/service-orders/customer/12345678909', {
        method: 'GET',
      }),
    );

    expect(response).toBeDefined();
    expect(response.status).not.toBe(401);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.json()).toEqual([]);
  });
});
