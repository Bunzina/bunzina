import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test';

mock.module('@lucas-pmelo/logger', () => ({
  default: {
    warn: mock(),
  },
}));

const originalApiKey = process.env.API_KEY;
process.env.API_KEY = 'test-api-key';

let verifyApiKey: typeof import('./api-key').verifyApiKey;

beforeEach(async () => {
  if (!verifyApiKey) {
    ({ verifyApiKey } = await import('./api-key'));
  }
});

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
