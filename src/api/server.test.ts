import { mockFn } from 'bun-mock-extended';
import { describe, expect, mock, test } from 'bun:test';

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

  test('GET /ready returns 200 when the database is available', async () => {
    mockDb.mockResolvedValueOnce([]);

    const response = await app.handle(new Request('http://localhost/ready'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ready' });
  });

  test('GET /ready returns 503 when the database is unavailable', async () => {
    mockDb.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await app.handle(new Request('http://localhost/ready'));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'not_ready' });
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

  test('GET /customers/id/:id returns the complete customer for a valid Api-Key', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    mockDb.mockResolvedValueOnce([
      {
        id,
        name: 'John Doe',
        document: '12345678909',
        document_kind: 'CPF',
        email: 'john@example.com',
        phone: '+1234567890',
        address_street: '123 Main St',
        address_number: '456',
        address_neighborhood: 'Downtown',
        address_city: 'Anytown',
        address_state: 'CA',
        address_zip_code: '12345',
        address_complement: 'Suite 7',
        created_at: new Date('2025-06-15T12:00:00.000Z'),
        updated_at: new Date('2025-06-16T12:00:00.000Z'),
      },
    ]);

    const response = await app.handle(
      new Request(`http://localhost/customers/id/${id}`, {
        method: 'GET',
        headers: { 'Api-Key': 'test-only-api-key' },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.json()).toEqual({
      id,
      name: 'John Doe',
      document: '12345678909',
      documentKind: 'CPF',
      email: 'john@example.com',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        number: '456',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        neighborhood: 'Downtown',
        complement: 'Suite 7',
      },
      createdAt: '2025-06-15',
      updatedAt: '2025-06-16',
    });
  });

  test('GET /customers/id/:id still requires authentication', async () => {
    const response = await app.handle(
      new Request(
        'http://localhost/customers/id/550e8400-e29b-41d4-a716-446655440000',
        { method: 'GET' },
      ),
    );

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

  test('GET /metrics exposes HTTP metrics without sensitive route parameters', async () => {
    const customerId = '550e8400-e29b-41d4-a716-446655440000';
    await app.handle(
      new Request('http://localhost/customers/12345678901', {
        method: 'GET',
      }),
    );
    await app.handle(
      new Request(`http://localhost/customers/id/${customerId}`, {
        method: 'GET',
      }),
    );

    const response = await app.handle(
      new Request('http://localhost/metrics', { method: 'GET' }),
    );
    const metrics = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain(
      'text/plain; version=0.0.4',
    );
    expect(metrics).toContain('bunzina_http_requests_total');
    expect(metrics).toContain('route="/customers/:documentNumber"');
    expect(metrics).toContain('route="/customers/id/:id"');
    expect(metrics).not.toContain('12345678901');
    expect(metrics).not.toContain(customerId);
  });
});
