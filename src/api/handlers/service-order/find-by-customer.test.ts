import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { findServiceOrdersByCustomerHandler } from './find-by-customer';

describe('find service orders by customer handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 200 when finding service orders for a customer', async () => {
    const customerId = 'customer-id';
    const serviceOrderId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    mockDb.mockImplementation((...args: unknown[]) => {
      const [strings] = args as [TemplateStringsArray];
      const query = strings.join('');

      if (query.includes('FROM bunzina.customers')) {
        return Promise.resolve([
          {
            id: customerId,
            name: 'John Doe',
            document: '12345678909',
            document_kind: 'CPF',
            email: 'john@example.com',
            phone: '+1234567890',
            address_street: '123 Main St',
            address_number: '456',
            address_neighborhood: 'Downtown',
            address_city: 'Anytown',
            address_state: 'CA',
            address_zip_code: '12345',
            address_complement: undefined,
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ] as unknown[]);
      }

      if (query.includes('FROM bunzina.service_orders')) {
        return Promise.resolve([
          {
            id: serviceOrderId,
            customer_id: customerId,
            vehicle_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            status: 'RECEIVED',
            quote_services_total: 120,
            quote_auto_parts_total: 80,
            quote_total: 200,
            created_at: createdAt,
            updated_at: updatedAt,
            approved_at: null,
            started_at: null,
            completed_at: null,
            delivered_at: null,
          },
        ] as unknown[]);
      }

      if (query.includes('FROM bunzina.service_order_service_items')) {
        return Promise.resolve([
          {
            id: 'service-item-1',
            service_order_id: serviceOrderId,
            service_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            price: 120,
            description: 'Brake check',
          },
        ] as unknown[]);
      }

      if (query.includes('FROM bunzina.service_order_auto_part_items')) {
        return Promise.resolve([
          {
            id: 'auto-part-item-1',
            service_order_id: serviceOrderId,
            auto_part_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            quantity: 2,
            unit_price: 40,
            total_price: 80,
            description: 'Brake pad',
          },
        ] as unknown[]);
      }

      return Promise.resolve([] as unknown[]);
    });

    const ctx = {
      request: { method: 'GET' },
      params: { documentNumber: '12345678909' },
    } as unknown as Context;

    const result = await findServiceOrdersByCustomerHandler(ctx);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual([
      {
        status: 'RECEIVED',
        serviceItems: [
          {
            description: 'Brake check',
            price: 120,
          },
        ],
        autoPartItems: [
          {
            description: 'Brake pad',
            quantity: 2,
            unitPrice: 40,
            totalPrice: 80,
          },
        ],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);
  });

  test('should return 200 with an empty array when customer does not exist', async () => {
    mockDb.mockImplementationOnce(() => Promise.resolve([] as unknown[]));

    const ctx = {
      request: { method: 'GET' },
      params: { documentNumber: '12345678909' },
    } as unknown as Context;

    const result = await findServiceOrdersByCustomerHandler(ctx);

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual([]);
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: { method: 'GET' },
      params: { documentNumber: '12345678909' },
    } as unknown as Context;

    const result = await findServiceOrdersByCustomerHandler(ctx);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({
      error: 'Failed to find service orders for customer',
    });
  });
});
