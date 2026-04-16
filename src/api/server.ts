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
import { createServiceRouteSchema } from './handlers/service/schema';
import { createUserHandler } from './handlers/user/create';
import { deleteUserHandler } from './handlers/user/delete';
import { findUserHandler } from './handlers/user/find';
import { loginHandler } from './handlers/user/login';
import {
  createUserSchema,
  deleteUserSchema,
  findUserSchema,
  loginSchema,
  updateUserSchema,
} from './handlers/user/schema';
import { updateUserHandler } from './handlers/user/update';
import { createVehicleHandler } from './handlers/vehicle/create';
import { createVehicleSchema } from './handlers/vehicle/schema';
import { authMiddleware } from './middleware/auth';

const app = new Elysia();

app.use(
  openapi({
    documentation: {
      info: {
        title: 'Bunzina API',
        version: '1.0.0',
        description: `API para gestão de oficina mecânica.

## Recursos

- **Auth** — Autenticação via JWT (login)
- **Users** — Cadastro e gestão de usuários (ADMIN, MECHANIC, CUSTOMER)
- **Customers** — Cadastro de clientes com documento, endereço e contato
- **Vehicles** — Cadastro de veículos vinculados a clientes

## Autenticação

A maioria das rotas exige um token JWT no header \`Authorization\`:

\`\`\`
Authorization: Bearer <token>
\`\`\`

O token é obtido via \`POST /auth/login\`.

**Exceção:** a criação de usuário com role \`CUSTOMER\` (\`POST /users\`) não exige autenticação.
`,
      },
      tags: [
        {
          name: 'Health',
          description: 'Verificação de saúde da API',
        },
        {
          name: 'Auth',
          description: 'Autenticação e geração de token JWT',
        },
        {
          name: 'Users',
          description:
            'Gestão de usuários do sistema (ADMIN, MECHANIC, CUSTOMER)',
        },
        {
          name: 'Customers',
          description: 'Cadastro e gestão de clientes da oficina',
        },
        {
          name: 'Vehicles',
          description: 'Cadastro de veículos vinculados a clientes',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    path: '/swagger',
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

// Auth routes
app.post('/auth/login', async (context) => loginHandler(context), loginSchema);

// Public user registration (CUSTOMER role only, others require auth)
app.post(
  '/users',
  async (context) => createUserHandler(context),
  createUserSchema,
);

// Protected admin routes
app.guard(
  {
    beforeHandle: async (context) => authMiddleware(context),
  },
  (app) => {
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

    // Vehicle routes
    app.post(
      '/vehicles',
      async (context) => createVehicleHandler(context),
      createVehicleSchema,
    );

    // User routes
    app.get(
      '/users/:id',
      async (context) => findUserHandler(context),
      findUserSchema,
    );
    app.put(
      '/users/:id',
      async (context) => updateUserHandler(context),
      updateUserSchema,
    );
    app.delete(
      '/users/:id',
      async (context) => deleteUserHandler(context),
      deleteUserSchema,
    );

    return app;
  },
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
app.post(
  '/services',
  async (context) => createServiceHandler(context),
  createServiceRouteSchema,
);

app.get('/', ({ redirect }) => redirect('/swagger'), {
  detail: { hide: true },
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000/swagger');
});
