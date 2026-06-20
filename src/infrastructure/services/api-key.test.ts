import { afterAll, describe, expect, mock, test } from 'bun:test';
import { verifyApiKey } from './api-key';

mock.module('@lucas-pmelo/logger', () => ({
  default: {
    warn: mock(),
  },
}));

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
});
