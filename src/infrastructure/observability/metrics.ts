import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client';

const registry = new Registry();

collectDefaultMetrics({ register: registry });

export const httpRequestsTotal = new Counter({
  name: 'bunzina_http_requests_total',
  help: 'Total number of HTTP requests handled by Bunzina.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'bunzina_http_request_duration_seconds',
  help: 'HTTP request duration in seconds.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

export const httpRequestsInFlight = new Gauge({
  name: 'bunzina_http_requests_in_flight',
  help: 'Number of HTTP requests currently being handled.',
  registers: [registry],
});

const dynamicRoutePatterns: Array<[RegExp, string]> = [
  [
    /^\/service-orders\/services\/[^/]+\/complete$/,
    '/service-orders/services/:id/complete',
  ],
  [
    /^\/service-orders\/[^/]+\/quote\/confirm$/,
    '/service-orders/:id/quote/confirm',
  ],
  [/^\/service-orders\/[^/]+\/status$/, '/service-orders/:id/status'],
  [
    /^\/service-orders\/customer\/[^/]+$/,
    '/service-orders/customer/:documentNumber',
  ],
  [/^\/service-orders\/[^/]+$/, '/service-orders/:id'],
  [/^\/customers\/[^/]+$/, '/customers/:documentNumber'],
  [/^\/auto-parts\/[^/]+\/stock-movements$/, '/auto-parts/:id/stock-movements'],
  [/^\/(?:auto-parts|services|users|vehicles)\/[^/]+$/, '/:resource/:id'],
];

export const normalizeRoute = (pathname: string): string => {
  for (const [pattern, route] of dynamicRoutePatterns) {
    if (pattern.test(pathname)) {
      return route;
    }
  }

  return pathname || '/';
};

const getStatusCode = (status: number | string | undefined): string => {
  const statusCode = Number(status);
  return Number.isInteger(statusCode) && statusCode > 0
    ? String(statusCode)
    : '200';
};

const getRequestLabels = (
  request: Request,
  status: number | string | undefined,
) => {
  const url = new URL(request.url);

  return {
    method: request.method,
    route: normalizeRoute(url.pathname),
    status_code: getStatusCode(status),
  };
};

export const createHttpMetrics = () => {
  const requestStartTimes = new WeakMap<Request, number>();

  return {
    start(request: Request) {
      requestStartTimes.set(request, performance.now());
      httpRequestsInFlight.inc();
    },
    finish(request: Request, status: number | string | undefined) {
      const labels = getRequestLabels(request, status);
      const startedAt = requestStartTimes.get(request);
      const durationSeconds = startedAt
        ? (performance.now() - startedAt) / 1000
        : 0;

      httpRequestsTotal.inc(labels);
      httpRequestDurationSeconds.observe(labels, durationSeconds);
      httpRequestsInFlight.dec();
      requestStartTimes.delete(request);
    },
  };
};

export const metricsContentType = 'text/plain; version=0.0.4; charset=utf-8';

export const getMetrics = async (): Promise<string> => registry.metrics();
