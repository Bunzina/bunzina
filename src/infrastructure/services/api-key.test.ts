import { afterAll, describe, expect, test } from 'bun:test';
import { verifyApiKey } from './api-key';

const originalApiKey = process.env.API_KEY;
process.env.API_KEY = 'test-api-key';

afterAll(() => {
  if (originalApiKey === undefined) {
    delete process.env.API_KEY;
    return;
  }

  process.env.API_KEY = originalApiKey;
});

describe('api key service', () => {
  test('should allow a valid api key', () => {
    expect(() => {
      verifyApiKey('test-api-key');
    }).not.toThrow();
  });

  test('should reject an invalid api key', () => {
    expect(() => {
      verifyApiKey('invalid-api-key');
    }).toThrow('Unauthorized');
  });

  test('should reject requests when the api key is not configured', () => {
    const configuredApiKey = process.env.API_KEY;
    delete process.env.API_KEY;

    expect(() => verifyApiKey('test-api-key')).toThrow(
      'API_KEY must be configured',
    );

    process.env.API_KEY = configuredApiKey;
  });
});
