import { describe, expect, test } from 'bun:test';
import { build, shouldTrace, tracing } from './tracing';

describe('tracing', () => {
  test('does not trace health and metrics endpoints', () => {
    expect(shouldTrace(new Request('http://localhost/health'))).toBe(false);
    expect(shouldTrace(new Request('http://localhost/ready'))).toBe(false);
    expect(shouldTrace(new Request('http://localhost/metrics'))).toBe(false);
  });

  test('traces application endpoints', () => {
    expect(shouldTrace(new Request('http://localhost/customers'))).toBe(true);
  });

  test('traces requests with an invalid URL', () => {
    const request = { url: 'invalid-url' } as Request;

    expect(shouldTrace(request)).toBe(true);
  });

  test('is disabled when no OTLP endpoint is configured', () => {
    expect(tracing).toBeNull();
  });

  test('builds the OpenTelemetry plugin', () => {
    expect(build()).toBeDefined();
  });
});
