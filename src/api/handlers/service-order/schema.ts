import { createServiceOrderSchema } from '@/adapters/input/service-order/validations/create-service-order-schema';
import { findCustomerSchema } from '@/adapters/input/customer/validations/find-customer-schema';
import { deleteServiceOrderSchema } from '@/adapters/input/service-order/validations/delete-service-order-schema';
import { findServiceOrderSchema } from '@/adapters/input/service-order/validations/find-service-order-schema';
import { findServiceOrderItemSchema } from '@/adapters/input/service-order/validations/find-service-order-item-schema';
import { listServiceOrdersSchema } from '@/adapters/input/service-order/validations/list-service-orders-schema';
import { updateServiceOrderStatusBodySchema } from '@/adapters/input/service-order/validations/update-service-order-status-schema';
import { updateServiceOrderBodySchema } from '@/adapters/input/service-order/validations/update-service-order-schema';
import { validateQuoteConfirmationSchema } from '@/adapters/input/service-order/validations/validate-quote-confirmation-schema';
import { t } from 'elysia';

const serviceOrderStatusSchema = t.Union([
  t.Literal('RECEIVED'),
  t.Literal('IN_DIAGNOSTIC'),
  t.Literal('AWAITING_APPROVAL'),
  t.Literal('IN_EXECUTION'),
  t.Literal('COMPLETED'),
  t.Literal('DELIVERED'),
  t.Literal('CANCELED'),
]);

const serviceOrderItemResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  serviceId: t.String({ format: 'uuid' }),
  price: t.Number(),
  isCompleted: t.Boolean(),
  description: t.Optional(t.String()),
  finishedAt: t.Optional(t.String({ format: 'date-time' })),
  executionTimeMs: t.Optional(t.Number()),
});

const serviceOrderAutoPartItemResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  autoPartId: t.String({ format: 'uuid' }),
  quantity: t.Number(),
  unitPrice: t.Number(),
  totalPrice: t.Optional(t.Number()),
  description: t.Optional(t.String()),
});

const serviceOrderQuoteResponseSchema = t.Object({
  servicesTotal: t.Number(),
  autoPartsTotal: t.Number(),
  total: t.Number(),
});

const serviceOrderResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  customerId: t.String({ format: 'uuid' }),
  vehicleId: t.String({ format: 'uuid' }),
  status: serviceOrderStatusSchema,
  serviceItems: t.Array(serviceOrderItemResponseSchema),
  autoPartItems: t.Array(serviceOrderAutoPartItemResponseSchema),
  quote: serviceOrderQuoteResponseSchema,
  createdAt: t.String({ format: 'date-time' }),
  updatedAt: t.String({ format: 'date-time' }),
  approvedAt: t.Optional(t.String({ format: 'date-time' })),
  startedAt: t.Optional(t.String({ format: 'date-time' })),
  completedAt: t.Optional(t.String({ format: 'date-time' })),
  deliveredAt: t.Optional(t.String({ format: 'date-time' })),
});

const serviceOrderPublicServiceItemResponseSchema = t.Object({
  description: t.Optional(t.String()),
  price: t.Number(),
});

const serviceOrderPublicAutoPartItemResponseSchema = t.Object({
  description: t.Optional(t.String()),
  quantity: t.Number(),
  unitPrice: t.Number(),
  totalPrice: t.Optional(t.Number()),
});

const serviceOrderPublicResponseSchema = t.Object({
  status: serviceOrderStatusSchema,
  serviceItems: t.Array(serviceOrderPublicServiceItemResponseSchema),
  autoPartItems: t.Array(serviceOrderPublicAutoPartItemResponseSchema),
  createdAt: t.String({ format: 'date-time' }),
  updatedAt: t.String({ format: 'date-time' }),
  approvedAt: t.Optional(t.String({ format: 'date-time' })),
  startedAt: t.Optional(t.String({ format: 'date-time' })),
  completedAt: t.Optional(t.String({ format: 'date-time' })),
  deliveredAt: t.Optional(t.String({ format: 'date-time' })),
});

const serviceItemResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  serviceId: t.String({ format: 'uuid' }),
  price: t.Number(),
  isCompleted: t.Boolean(),
  description: t.Optional(t.String()),
  finishedAt: t.Optional(t.String({ format: 'date-time' })),
  executionTimeMs: t.Optional(t.Number()),
});

export const createServiceOrderRouteSchema = {
  detail: {
    tags: ['Service-Orders'],
    summary: 'Create service order',
    description:
      'Create a service order with service items and auto-part items.',
    responses: {
      '201': { description: 'Service order created successfully' },
      '400': { description: 'Invalid data' },
      '401': { description: 'Missing or invalid token' },
      '500': { description: 'Internal server error' },
    },
  },
  body: createServiceOrderSchema,
  response: {
    201: serviceOrderResponseSchema,
  },
};

export const findServiceOrderRouteSchema = {
  detail: {
    tags: ['Service-Orders'],
    summary: 'Find service order',
    description: 'Find a service order by id.',
    responses: {
      '200': { description: 'Service order found successfully' },
      '400': { description: 'Invalid data' },
      '401': { description: 'Missing or invalid token' },
      '404': { description: 'Service order not found' },
      '500': { description: 'Internal server error' },
    },
  },
  params: findServiceOrderSchema,
  response: {
    200: serviceOrderResponseSchema,
  },
};

export const findServiceOrdersByCustomerRouteSchema = {
  detail: {
    tags: ['Service-Orders'],
    summary: 'Find service orders by customer',
    description:
      'Public route to list service orders linked to a customer document number.',
    responses: {
      '200': { description: 'Service orders found successfully' },
      '400': { description: 'Invalid data' },
      '500': { description: 'Internal server error' },
    },
  },
  params: findCustomerSchema,
  response: {
    200: t.Array(serviceOrderPublicResponseSchema),
  },
};

export const listServiceOrdersRouteSchema = {
  detail: {
    tags: ['Service-Orders'],
    summary: 'List service orders',
    description:
      'List service orders with pagination and optional filters by customer, vehicle, status and created_at range.',
    responses: {
      '200': { description: 'Service orders listed successfully' },
      '400': { description: 'Invalid data' },
      '401': { description: 'Missing or invalid token' },
      '500': { description: 'Internal server error' },
    },
  },
  query: listServiceOrdersSchema,
  response: {
    200: t.Array(serviceOrderResponseSchema),
  },
};

export const updateServiceOrderRouteSchema = {
  detail: {
    tags: ['Service-Orders'],
    summary: 'Update service order',
    description: 'Update a service order by id.',
    responses: {
      '200': { description: 'Service order updated successfully' },
      '400': { description: 'Invalid data' },
      '401': { description: 'Missing or invalid token' },
      '404': { description: 'Service order not found' },
      '500': { description: 'Internal server error' },
    },
  },
  params: findServiceOrderSchema,
  body: updateServiceOrderBodySchema,
  response: {
    200: serviceOrderResponseSchema,
  },
};

export const deleteServiceOrderRouteSchema = {
  detail: {
    tags: ['Service-Orders'],
    summary: 'Delete service order',
    description: 'Delete a service order by id.',
    responses: {
      '204': { description: 'Service order deleted successfully' },
      '400': { description: 'Invalid data' },
      '401': { description: 'Missing or invalid token' },
      '404': { description: 'Service order not found' },
      '500': { description: 'Internal server error' },
    },
  },
  params: deleteServiceOrderSchema,
};

export const updateServiceOrderStatusRouteSchema = {
  detail: {
    tags: ['Service-Orders'],
    summary: 'Update service order status',
    description: 'Update a service order status by id.',
    responses: {
      '200': { description: 'Service order status updated successfully' },
      '400': { description: 'Invalid data' },
      '401': { description: 'Missing or invalid token' },
      '403': { description: 'Status transition forbidden' },
      '404': { description: 'Service order not found' },
      '500': { description: 'Internal server error' },
    },
  },
  params: findServiceOrderSchema,
  body: updateServiceOrderStatusBodySchema,
  response: {
    200: serviceOrderResponseSchema,
  },
};

export const completeServiceOrderItemRouteSchema = {
  detail: {
    tags: ['Service-Orders'],
    summary: 'Complete a single service item',
    description: 'Mark a service-order service item as completed by its id.',
    responses: {
      '200': { description: 'Service item completed successfully' },
      '400': { description: 'Invalid data' },
      '401': { description: 'Missing or invalid token' },
      '403': {
        description: 'Forbidden when parent service order is not in execution',
      },
      '404': { description: 'Service item not found' },
      '500': { description: 'Internal server error' },
    },
  },
  params: findServiceOrderItemSchema,
  response: {
    200: serviceItemResponseSchema,
  },
};

export const validateQuoteConfirmationRouteSchema = {
  detail: {
    tags: ['Service-Orders'],
    summary: 'Validate quote confirmation',
    description:
      'Confirm or reject a service-order quote by customer document and service-order id.',
    responses: {
      '200': { description: 'Quote confirmation validated successfully' },
      '400': { description: 'Invalid data' },
      '401': { description: 'Missing or invalid token' },
      '403': {
        description: 'Service order is not awaiting approval for quote action',
      },
      '404': {
        description: 'Service order not found or customer is not the owner',
      },
      '500': { description: 'Internal server error' },
    },
  },
  params: findServiceOrderSchema,
  body: validateQuoteConfirmationSchema.omit({ id: true }),
  response: {
    200: serviceOrderPublicResponseSchema,
  },
};
