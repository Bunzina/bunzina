import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import {
  authRequest,
  createAutoPart,
  createCustomer,
  createService,
  createUserAndLogin,
  createVehicle,
  handleRequest,
  setupIntegration,
  truncateDatabase,
} from './helpers';

describe('Integration - Service Orders by customer (public)', () => {
  beforeAll(async () => {
    await setupIntegration();
  });

  afterEach(async () => {
    await truncateDatabase();
  });

  test('GET /service-orders/customer/:documentNumber returns public reduced payload', async () => {
    const { token } = await createUserAndLogin();
    const { customer } = await createCustomer(token);
    const vehicle = await createVehicle(token, customer.id);
    const service = await createService(token);
    const autoPart = await createAutoPart(token);

    const createResponse = await handleRequest(
      authRequest('/service-orders', token, {
        method: 'POST',
        body: JSON.stringify({
          customerId: customer.id,
          vehicleId: vehicle.id,
          serviceItems: [
            {
              serviceId: service.id,
              price: 150,
              description: 'Service desc',
            },
          ],
          autoPartItems: [
            {
              autoPartId: autoPart.id,
              quantity: 2,
              unitPrice: 4500,
              description: 'Part desc',
            },
          ],
        }),
      }),
    );

    expect(createResponse.status).toBe(201);

    const listResponse = await handleRequest(
      new Request(
        `http://localhost/service-orders/customer/${customer.document}`,
      ),
    );

    expect(listResponse.status).toBe(200);
    expect(await listResponse.json()).toEqual([
      {
        status: 'RECEIVED',
        serviceItems: [
          {
            description: 'Service desc',
            price: '150.00',
          },
        ],
        autoPartItems: [
          {
            description: 'Part desc',
            quantity: 2,
            unitPrice: '4500.00',
            totalPrice: '9000.00',
          },
        ],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);
  });

  test('GET /service-orders returns paginated list', async () => {
    const { token } = await createUserAndLogin();
    const { customer } = await createCustomer(token);
    const vehicle = await createVehicle(token, customer.id);
    const service = await createService(token);
    const autoPart = await createAutoPart(token);

    const createResponse = await handleRequest(
      authRequest('/service-orders', token, {
        method: 'POST',
        body: JSON.stringify({
          customerId: customer.id,
          vehicleId: vehicle.id,
          serviceItems: [
            {
              serviceId: service.id,
              price: 150,
              description: 'Service desc',
            },
          ],
          autoPartItems: [
            {
              autoPartId: autoPart.id,
              quantity: 2,
              unitPrice: 4500,
              description: 'Part desc',
            },
          ],
        }),
      }),
    );

    expect(createResponse.status).toBe(201);

    const listResponse = await handleRequest(
      authRequest('/service-orders?page=1&limit=10', token),
    );

    expect(listResponse.status).toBe(200);

    const responseData = await listResponse.json();

    expect(responseData).toEqual({
      data: [
        {
          autoPartItems: [
            {
              autoPartId: autoPart.id,
              description: 'Part desc',
              id: expect.any(String),
              quantity: 2,
              totalPrice: '9000.00',
              unitPrice: '4500.00',
            },
          ],
          createdAt: expect.any(String),
          customerId: customer.id,
          id: expect.any(String),
          quote: {
            autoPartsTotal: '9000.00',
            servicesTotal: '150.00',
            total: '150.009000.00',
          },
          serviceItems: [
            {
              description: 'Service desc',
              id: expect.any(String),
              isCompleted: false,
              price: '150.00',
              serviceId: service.id,
            },
          ],
          status: 'RECEIVED',
          updatedAt: expect.any(String),
          vehicleId: vehicle.id,
        },
      ],
      pagination: {
        limit: 10,
        page: 1,
      },
    });
  });
});
