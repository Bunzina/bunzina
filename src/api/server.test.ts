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

  test('POST /auth/login returns 422 when body is invalid', async () => {
    const response = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
          password: '',
        }),
      }),
    );

    expect(response).toBeDefined();
    expect(response.status).toBe(422);
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

  test('POST /service-orders/:id/quote/confirm is public', async () => {
    mockDb
      .mockResolvedValueOnce([
        {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          status: 'AWAITING_APPROVAL',
          quote_services_total: 100,
          quote_auto_parts_total: 50,
          quote_total: 150,
          created_at: new Date(),
          updated_at: new Date(),
          approved_at: null,
          started_at: null,
          completed_at: null,
          delivered_at: null,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          name: 'John Doe',
          document: '12345678909',
          document_kind: 'CPF',
          email: 'john@example.com',
          phone: '+5511999999999',
          address_street: 'Rua A',
          address_number: '100',
          address_city: 'Sao Paulo',
          address_state: 'SP',
          address_zip_code: '01001000',
          address_neighborhood: 'Centro',
          address_complement: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

    const response = await app.handle(
      new Request(
        'http://localhost/service-orders/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/quote/confirm',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentNumber: '123.456.789-09',
            isConfirmed: true,
          }),
        },
      ),
    );

    expect(response).toBeDefined();
    expect(response.status).not.toBe(401);
  });
});
