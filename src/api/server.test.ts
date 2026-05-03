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
});
