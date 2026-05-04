import { createServiceOrderSchema } from '@/adapters/input/service-order/validations/create-service-order-schema';
import { deleteServiceOrderSchema } from '@/adapters/input/service-order/validations/delete-service-order-schema';
import { findServiceOrderSchema } from '@/adapters/input/service-order/validations/find-service-order-schema';
import { updateServiceOrderStatusBodySchema } from '@/adapters/input/service-order/validations/update-service-order-status-schema';
import { updateServiceOrderBodySchema } from '@/adapters/input/service-order/validations/update-service-order-schema';

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
};
