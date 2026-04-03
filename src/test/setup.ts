import { mock } from 'bun:test';

mock.module('@lucas-pmelo/logger', () => ({
  default: {
    setEvent: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
}));
