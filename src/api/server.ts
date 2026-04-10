import { createServiceSchema } from '@/adapters/input/service/validations/create-service-schema';
import openapi from '@elysiajs/openapi';
import Elysia from 'elysia';
import z from 'zod';
import { createCustomerHandler } from './handlers/customer/create';
import { deleteCustomerHandler } from './handlers/customer/delete';
import { findCustomerHandler } from './handlers/customer/find';
import {
  createCustomerSchema,
  deleteCustomerSchema,
  findCustomerSchema,
  updateCustomerSchema,
} from './handlers/customer/schema';
import { updateCustomerHandler } from './handlers/customer/update';
import { healthSchema } from './handlers/health/schema';
import { createServiceHandler } from './handlers/service/create';

const app = new Elysia();

app.use(
  openapi({
    documentation: {
      info: { title: 'Bunzina API', version: '1.0.0' },
    },
    mapJsonSchema: {
      zod: z.toJSONSchema,
    },
  }),
);

app.get(
  '/health',
  () =>
    new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  healthSchema,
);

// Customer routes
app.post(
  '/customers',
  async (context) => createCustomerHandler(context),
  createCustomerSchema,
);
app.get(
  '/customers/:documentNumber',
  async (context) => findCustomerHandler(context),
  findCustomerSchema,
);
app.put(
  '/customers/:documentNumber',
  async (context) => updateCustomerHandler(context),
  updateCustomerSchema,
);
app.delete(
  '/customers/:documentNumber',
  async (context) => deleteCustomerHandler(context),
  deleteCustomerSchema,
);

// Service routes
app.post('/services', async (context) => createServiceHandler(context), {
  body: createServiceSchema,
  detail: {
    tags: ['Service'],
    summary: 'Criar serviço',
    description: 'Cria um novo serviço com os dados fornecidos.',
    requestBody: {
      content: {
        'application/json': {
          examples: {
            name: 'Oil Change',
            description: 'Complete oil change service',
            price: 50,
            durationInMinutes: 30,
          },
        },
      },
    },
    responses: {
      '201': { description: 'Serviço criado com sucesso' },
      '400': { description: 'Dados inválidos' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
});

app.get('/', ({ redirect }) => redirect('/swagger'), {
  detail: { hide: true },
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000/swagger');
});
