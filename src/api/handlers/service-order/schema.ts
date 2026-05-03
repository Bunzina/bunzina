import { createServiceOrderSchema } from '@/adapters/input/service-order/validations/create-service-order-schema';

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
