import { describe, test, expect, mock } from 'bun:test';
import Elysia from 'elysia';
import swagger from '@elysiajs/swagger';

describe('server', () => {
  test('should have a GET / route that returns Hello World', async () => {
    const app = new Elysia();
    app.use(swagger());
    app.get('/', () => 'Hello World!');

    const response = await app.handle(
      new Request('http://localhost:3000/', {
        method: 'GET',
      }),
    );

    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe('Hello World!');
  });

  test('should have a POST /customers route', async () => {
    const app = new Elysia();
    app.use(swagger());

    const mockHandler = mock(() => Promise.resolve('Customer created'));

    app.post('/customers', async () => {
      return await mockHandler();
    });

    const response = await app.handle(
      new Request('http://localhost:3000/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'John Doe',
          document: '12345678909',
          email: 'john@example.com',
          phone: '+1234567890',
          address: {
            street: '123 Main St',
            number: '456',
            neighborhood: 'Downtown',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
          },
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalled();
  });

  test('should serve swagger documentation', async () => {
    const app = new Elysia();
    app.use(swagger());
    app.get('/', () => 'Hello World!');

    const response = await app.handle(
      new Request('http://localhost:3000/swagger/json', {
        method: 'GET',
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
  });
});
