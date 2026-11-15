import { describe, expect, test } from 'bun:test';
import { createHttpMetrics, getMetrics, normalizeRoute } from './metrics';

describe('observability metrics', () => {
  test.each([
    [
      '/service-orders/order-id/quote/confirm',
      '/service-orders/:id/quote/confirm',
    ],
    ['/customers/id/customer-id', '/customers/id/:id'],
    ['/customers/12345678909', '/customers/:documentNumber'],
    ['/auto-parts/part-id/stock-movements', '/auto-parts/:id/stock-movements'],
    ['/auto-parts/part-id', '/:resource/:id'],
    ['/services/service-id', '/:resource/:id'],
    ['/users/user-id', '/:resource/:id'],
    ['/vehicles/vehicle-id', '/:resource/:id'],
  ])('normalizes %s', (pathname, expected) => {
    expect(normalizeRoute(pathname)).toBe(expected);
  });

  test('returns the original path and root for static paths', () => {
    expect(normalizeRoute('/health')).toBe('/health');
    expect(normalizeRoute('')).toBe('/');
  });

  test('records requests with valid and fallback status codes', async () => {
    const metrics = createHttpMetrics();
    const request = new Request('http://localhost/orders');

    metrics.start(request);
    metrics.finish(request, 201);
    metrics.finish(new Request('http://localhost/orders'), undefined);

    const output = await getMetrics();

    expect(output).toContain(
      'bunzina_http_requests_total{method="GET",route="/orders",status_code="201"}',
    );
    expect(output).toContain(
      'bunzina_http_requests_total{method="GET",route="/orders",status_code="200"}',
    );
  });
});
