import { expect } from 'bun:test';

const BASE_URL = 'http://localhost';
const DEFAULT_DATABASE_URL = 'postgres://bun:bun@localhost:5433/bunzina_test';

let app: typeof import('../../api/server').app | undefined;
let db: (typeof import('@/infrastructure/configs/database'))['db'] | undefined;
let migrationsReady = false;

type HeadersInput =
  | Headers
  | Record<string, string | readonly string[]>
  | string[][];

const buildHeaders = (headers?: HeadersInput) => new Headers(headers);

export const jsonRequest = (path: string, init: RequestInit = {}) => {
  const headers = buildHeaders(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return new Request(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });
};

export const authRequest = (
  path: string,
  token: string,
  init: RequestInit = {},
) => {
  const headers = buildHeaders(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return new Request(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });
};

export const setupIntegration = async () => {
  process.env.APP_ENV = process.env.APP_ENV ?? 'dev';
  process.env.DATABASE_URL =
    process.env.DATABASE_URL_TEST ?? DEFAULT_DATABASE_URL;

  if (!app) {
    ({ app } = await import('../../api/server'));
  }

  if (!db) {
    ({ db } = await import('@/infrastructure/configs/database'));
  }

  if (!migrationsReady) {
    const { runMigrations } = await import('../../../migrations/engine/index');
    await runMigrations();
    migrationsReady = true;
  }
};

const getApp = () => {
  if (!app) throw new Error('App not initialized');
  return app;
};

const getDb = () => {
  if (!db) throw new Error('Database not initialized');
  return db;
};

export const truncateDatabase = async () => {
  const dbInstance = getDb();
  await dbInstance`
    TRUNCATE TABLE
      bunzina.service_order_auto_part_items,
      bunzina.service_order_service_items,
      bunzina.stock_movements,
      bunzina.service_orders,
      bunzina.vehicles,
      bunzina.auto_parts,
      bunzina.services,
      bunzina.customers,
      bunzina.users
    RESTART IDENTITY CASCADE
  `;
};

export const uniqueSuffix = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const createUserAndLogin = async () => {
  const suffix = uniqueSuffix();
  const email = `integration.user.${suffix}@example.com`;
  const document = '11144477735';
  const password = 'senha123';

  const createUserResponse = await getApp().handle(
    jsonRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Integration User',
        document,
        email,
        password,
        role: 'CUSTOMER',
      }),
    }),
  );

  expect(createUserResponse.status).toBe(201);
  const createdUser = (await createUserResponse.json()) as { id: string };

  const loginResponse = await getApp().handle(
    jsonRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ document, password }),
    }),
  );

  expect(loginResponse.status).toBe(200);
  const loginBody = (await loginResponse.json()) as { token: string };

  return {
    userId: createdUser.id,
    document,
    token: loginBody.token,
  };
};

export const createCustomer = async (token: string) => {
  const suffix = uniqueSuffix();
  const payload = {
    name: 'Test Customer',
    document: '111.444.777-35',
    email: `customer.${suffix}@example.com`,
    phone: '+5511999999999',
    address: {
      street: 'Main St',
      number: '100',
      neighborhood: 'Downtown',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01310-100',
      complement: 'Apt 1',
    },
  };

  const response = await getApp().handle(
    authRequest('/customers', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  );

  expect(response.status).toBe(201);
  const customer = (await response.json()) as {
    id: string;
    document: string;
    email: string;
  };

  return { customer, payload };
};

export const createVehicle = async (token: string, customerId: string) => {
  const response = await getApp().handle(
    authRequest('/vehicles', token, {
      method: 'POST',
      body: JSON.stringify({
        customerId,
        licensePlate: 'ABC1D23',
        model: 'Model S',
        brand: 'Tesla',
        year: 2020,
      }),
    }),
  );

  expect(response.status).toBe(201);
  return (await response.json()) as { id: string };
};

export const createService = async (token: string) => {
  const response = await getApp().handle(
    authRequest('/services', token, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Oil Change',
        description: 'Full oil change',
        price: 150,
        durationInMinutes: 60,
      }),
    }),
  );

  expect(response.status).toBe(201);
  return (await response.json()) as { id: string };
};

export const createAutoPart = async (token: string) => {
  const response = await getApp().handle(
    authRequest('/auto-parts', token, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Oil Filter',
        description: 'Standard oil filter',
        price: 4500.77,
        stock: 10,
      }),
    }),
  );

  expect(response.status).toBe(201);
  return (await response.json()) as { id: string };
};

export const handleRequest = (request: Request) => getApp().handle(request);
