import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { db } from '@/infrastructure/configs/database';
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

type ServiceOrderFixture = {
  customer: { id: string; document: string };
  vehicle: { id: string };
  service: { id: string };
  autoPart: { id: string };
};

type CreatedServiceOrder = ServiceOrderFixture & {
  serviceOrder: {
    id: string;
    serviceItems: Array<{
      id: string;
      serviceId: string;
    }>;
    autoPartItems: Array<{
      id: string;
      autoPartId: string;
    }>;
  };
};

const buildServiceOrderFixture = async (
  token: string,
): Promise<ServiceOrderFixture> => {
  const { customer } = await createCustomer(token);
  const vehicle = await createVehicle(token, customer.id);
  const service = await createService(token);
  const autoPart = await createAutoPart(token);

  return { customer, vehicle, service, autoPart };
};

const createServiceOrder = async (
  token: string,
): Promise<CreatedServiceOrder> => {
  const fixture = await buildServiceOrderFixture(token);

  const response = await handleRequest(
    authRequest('/service-orders', token, {
      method: 'POST',
      body: JSON.stringify({
        customerId: fixture.customer.id,
        vehicleId: fixture.vehicle.id,
        serviceItems: [
          {
            serviceId: fixture.service.id,
            price: 150,
            description: 'Service desc',
          },
        ],
        autoPartItems: [
          {
            autoPartId: fixture.autoPart.id,
            quantity: 2,
            unitPrice: 4500,
            description: 'Part desc',
          },
        ],
      }),
    }),
  );

  expect(response.status).toBe(201);

  return {
    ...fixture,
    serviceOrder:
      (await response.json()) as CreatedServiceOrder['serviceOrder'],
  };
};

const moveServiceOrderToExecution = async (serviceOrderId: string) => {
  await db`
    UPDATE bunzina.service_orders
    SET status = 'IN_EXECUTION'
    WHERE id = ${serviceOrderId}
  `;
};

describe('Integration - Service Orders by customer (public)', () => {
  beforeAll(async () => {
    await setupIntegration();
  });

  afterEach(async () => {
    await truncateDatabase();
  });

  test('POST /service-orders creates a service order', async () => {
    const { token } = await createUserAndLogin();
    const fixture = await buildServiceOrderFixture(token);

    const response = await handleRequest(
      authRequest('/service-orders', token, {
        method: 'POST',
        body: JSON.stringify({
          customerId: fixture.customer.id,
          vehicleId: fixture.vehicle.id,
          serviceItems: [
            {
              serviceId: fixture.service.id,
              price: 150,
              description: 'Service desc',
            },
          ],
          autoPartItems: [
            {
              autoPartId: fixture.autoPart.id,
              quantity: 2,
              unitPrice: 4500,
              description: 'Part desc',
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: expect.any(String),
      customerId: fixture.customer.id,
      vehicleId: fixture.vehicle.id,
      status: 'RECEIVED',
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: fixture.service.id,
          price: 150,
          description: 'Service desc',
          isCompleted: false,
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: fixture.autoPart.id,
          quantity: 2,
          unitPrice: 4500,
          totalPrice: 9000,
          description: 'Part desc',
        },
      ],
      quote: {
        servicesTotal: 150,
        autoPartsTotal: 9000,
        total: 9150,
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('GET /service-orders/customer/:documentNumber returns public reduced payload', async () => {
    const { token } = await createUserAndLogin();
    const { customer } = await createServiceOrder(token);

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
    const { customer, vehicle, service, autoPart } =
      await buildServiceOrderFixture(token);

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

  test('GET /service-orders/:id returns a service order by id', async () => {
    const { token } = await createUserAndLogin();
    const { customer, vehicle, service, autoPart, serviceOrder } =
      await createServiceOrder(token);

    const response = await handleRequest(
      authRequest(`/service-orders/${serviceOrder.id}`, token),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: serviceOrder.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      status: 'RECEIVED',
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: service.id,
          price: '150.00',
          description: 'Service desc',
          isCompleted: false,
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: autoPart.id,
          quantity: 2,
          unitPrice: '4500.00',
          totalPrice: '9000.00',
          description: 'Part desc',
        },
      ],
      quote: {
        servicesTotal: '150.00',
        autoPartsTotal: '9000.00',
        total: expect.any(String),
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('PUT /service-orders/:id updates a service order', async () => {
    const { token } = await createUserAndLogin();
    const { customer, vehicle, autoPart, serviceOrder } =
      await createServiceOrder(token);
    const updatedServiceOne = await createService(token);
    const updatedServiceTwo = await createService(token);

    const response = await handleRequest(
      authRequest(`/service-orders/${serviceOrder.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          serviceItems: [
            {
              serviceId: updatedServiceOne.id,
              price: 120,
              description: 'Brake check',
            },
            {
              serviceId: updatedServiceTwo.id,
              price: 80,
            },
          ],
          autoPartItems: [
            {
              autoPartId: autoPart.id,
              quantity: 2,
              unitPrice: 50,
              description: 'Brake pad',
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: serviceOrder.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      status: 'RECEIVED',
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: updatedServiceOne.id,
          price: 120,
          description: 'Brake check',
          isCompleted: false,
        },
        {
          id: expect.any(String),
          serviceId: updatedServiceTwo.id,
          price: 80,
          isCompleted: false,
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: autoPart.id,
          quantity: 2,
          unitPrice: 50,
          totalPrice: 100,
          description: 'Brake pad',
        },
      ],
      quote: {
        servicesTotal: 200,
        autoPartsTotal: 100,
        total: 300,
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('DELETE /service-orders/:id deletes a service order', async () => {
    const { token } = await createUserAndLogin();
    const { serviceOrder } = await createServiceOrder(token);

    const response = await handleRequest(
      authRequest(`/service-orders/${serviceOrder.id}`, token, {
        method: 'DELETE',
      }),
    );

    expect(response.status).toBe(204);
  });

  test('PATCH /service-orders/:id/status updates a service order status', async () => {
    const { token } = await createUserAndLogin();
    const { customer, vehicle, service, autoPart, serviceOrder } =
      await createServiceOrder(token);

    const response = await handleRequest(
      authRequest(`/service-orders/${serviceOrder.id}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ direction: 'next' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: serviceOrder.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      status: 'IN_DIAGNOSTIC',
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: service.id,
          price: '150.00',
          description: 'Service desc',
          isCompleted: false,
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: autoPart.id,
          quantity: 2,
          unitPrice: '4500.00',
          totalPrice: '9000.00',
          description: 'Part desc',
        },
      ],
      quote: {
        servicesTotal: '150.00',
        autoPartsTotal: '9000.00',
        total: expect.any(String),
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('POST /service-orders/services/:id/complete completes a service item', async () => {
    const { token } = await createUserAndLogin();
    const { serviceOrder, service } = await createServiceOrder(token);

    await moveServiceOrderToExecution(serviceOrder.id);

    const serviceItemId = serviceOrder.serviceItems[0]?.id;
    expect(serviceItemId).toBeDefined();

    const completeResponse = await handleRequest(
      authRequest(`/service-orders/services/${serviceItemId}/complete`, token, {
        method: 'PATCH',
      }),
    );

    expect(completeResponse.status).toBe(200);
    expect(await completeResponse.json()).toEqual({
      id: serviceItemId,
      serviceId: service.id,
      price: '150.00',
      description: 'Service desc',
      isCompleted: true,
      finishedAt: expect.any(String),
      executionTimeMs: expect.any(Number),
    });
  });
});
