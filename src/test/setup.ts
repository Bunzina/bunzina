import { mock } from 'bun:test';

process.env.JWT_SECRET ??= 'test-jwt-secret';
process.env.API_KEY ??= 'test-only-api-key';

mock.module('@lucas-pmelo/logger', () => ({
  default: {
    setEvent: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
}));
