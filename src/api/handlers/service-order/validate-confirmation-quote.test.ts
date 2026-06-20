import { afterEach, beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import { mockFn } from 'bun-mock-extended';
import type { Context } from 'elysia';

mock.module('@lucas-pmelo/logger', () => ({
  default: {
    setEvent: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
}));

const mockDb = mockFn<(..._args: unknown[]) => Promise<unknown[]>>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
const mockTransaction =
  mockFn<(callback: (sql: typeof mockDb) => Promise<void>) => Promise<void>>();
(mockDb as unknown as { transaction: typeof mockTransaction }).transaction =
  mockTransaction;
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { validateQuoteConfirmationHandler } from './validate-confirmation-quote';

describe('validate quote confirmation handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
    mockTransaction.mockImplementation(async (callback) => {
      await callback(mockDb);
    });
  });

  afterEach(() => {
    mockDb.mockClear();
    mockTransaction.mockClear();
  });

  test('should validate and update a quote confirmation', async () => {
    const serviceOrderId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const customerId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const vehicleId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    mockDb
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: serviceOrderId,
            status: 'AWAITING_APPROVAL',
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
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: 'service-item-1',
            service_order_id: serviceOrderId,
            service_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            price: 120,
            description: 'Brake check',
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: 'auto-part-item-1',
            service_order_id: serviceOrderId,
            auto_part_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            quantity: 2,
            unit_price: 40,
            total_price: 80,
            description: 'Brake pad',
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: customerId,
            name: 'John Doe',
            document: '12345678909',
            document_kind: 'CPF',
            email: 'john@example.com',
            phone: '+5511999999999',
            address_street: 'Rua A',
            address_number: '100',
            address_city: 'Sao Paulo',
            address_state: 'SP',
            address_zip_code: '01001000',
            address_neighborhood: 'Centro',
            address_complement: null,
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ] as unknown[]),
      );

    const context = {
      request: { method: 'POST' },
      params: { id: serviceOrderId },
      body: {
        documentNumber: '123.456.789-09',
        isConfirmed: true,
      },
    } as unknown as Context;

    const result = await validateQuoteConfirmationHandler(context);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      status: 'IN_EXECUTION',
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
          totalPrice: 80,
          unitPrice: 40,
        },
      ],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      startedAt: expect.any(String),
    });
  });
});