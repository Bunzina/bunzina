import "bun:test";

declare global {
  const describe: typeof import("bun:test").describe;
  const test: typeof import("bun:test").test;
  const expect: typeof import("bun:test").expect;
  const beforeAll: typeof import("bun:test").beforeAll;
  const afterAll: typeof import("bun:test").afterAll;
  const beforeEach: typeof import("bun:test").beforeEach;
  const afterEach: typeof import("bun:test").afterEach;
}

export {};
