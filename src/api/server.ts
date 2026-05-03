import openapi from '@elysiajs/openapi';
import Elysia from 'elysia';
import z from 'zod';
import { createAutoPartHandler } from './handlers/auto-part/create';
import { deleteAutoPartHandler } from './handlers/auto-part/delete';
import { findAutoPartHandler } from './handlers/auto-part/find';
import { listAutoPartsHandler } from './handlers/auto-part/list';
import {
  createAutoPartSchema,
  deleteAutoPartRouteSchema,
  findAutoPartRouteSchema,
  listAutoPartsRouteSchema,
  updateAutoPartRouteSchema,
} from './handlers/auto-part/schema';
import { updateAutoPartHandler } from './handlers/auto-part/update';
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
import { deleteServiceHandler } from './handlers/service/delete';
import { findServiceHandler } from './handlers/service/find';
import {
  createServiceRouteSchema,
  deleteServiceRouteSchema,
  findServiceRouteSchema,
  updateServiceRouteSchema,
} from './handlers/service/schema';
import { updateServiceHandler } from './handlers/service/update';
import { createServiceOrderHandler } from './handlers/service-order/create';
import { createServiceOrderRouteSchema } from './handlers/service-order/schema';
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
import { deleteVehicleHandler } from './handlers/vehicle/delete';
import { findVehicleHandler } from './handlers/vehicle/find';
import { listVehiclesHandler } from './handlers/vehicle/list';
import {
  createVehicleSchema,
  deleteVehicleSchema,
  findVehicleSchema,
  listVehicleSchema,
  updateVehicleSchema,
} from './handlers/vehicle/schema';
import { sendNotificationHandler } from './handlers/notification/send';
import { notificationSchema } from './handlers/notification/schema';
import { updateVehicleHandler } from './handlers/vehicle/update';
import { authMiddleware } from './middleware/auth';

export const app = new Elysia();

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
          name: 'Services',
          description: 'Cadastro e gestão de serviços realizados em veículos',
        },
        {
          name: 'Service-Orders',
          description: 'Service order workflow and tracking',
        },
        {
          name: 'Vehicles',
          description: 'Cadastro de veículos vinculados a clientes',
        },
        {
          name: 'Notification',
          description: 'Envio de notificações para clientes',
        },
        {
          name: 'Auto-Parts',
          description: 'Cadastro e gestão de peças/insumos em estoque',
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
    app.get(
      '/vehicles',
      async (context) => listVehiclesHandler(context),
      listVehicleSchema,
    );
    app.get(
      '/vehicles/:id',
      async (context) => findVehicleHandler(context),
      findVehicleSchema,
    );
    app.put(
      '/vehicles/:id',
      async (context) => updateVehicleHandler(context),
      updateVehicleSchema,
    );
    app.delete(
      '/vehicles/:id',
      async (context) => deleteVehicleHandler(context),
      deleteVehicleSchema,
    );

    // Auto-Part routes
    app.post(
      '/auto-parts',
      async (context) => createAutoPartHandler(context),
      createAutoPartSchema,
    );
    app.get(
      '/auto-parts',
      async (context) => listAutoPartsHandler(context),
      listAutoPartsRouteSchema,
    );
    app.get(
      '/auto-parts/:id',
      async (context) => findAutoPartHandler(context),
      findAutoPartRouteSchema,
    );
    app.put(
      '/auto-parts/:id',
      async (context) => updateAutoPartHandler(context),
      updateAutoPartRouteSchema,
    );
    app.delete(
      '/auto-parts/:id',
      async (context) => deleteAutoPartHandler(context),
      deleteAutoPartRouteSchema,
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

    // Notification routes
    app.post(
      '/notifications',
      async (context) => sendNotificationHandler(context),
      notificationSchema,
    );

    // Service routes
    app.post(
      '/services',
      async (context) => createServiceHandler(context),
      createServiceRouteSchema,
    );
    app.get(
      '/services/:id',
      async (context) => findServiceHandler(context),
      findServiceRouteSchema,
    );
    app.put(
      '/services/:id',
      async (context) => updateServiceHandler(context),
      updateServiceRouteSchema,
    );
    app.delete(
      '/services/:id',
      async (context) => deleteServiceHandler(context),
      deleteServiceRouteSchema,
    );

    // Service order routes
    app.post(
      '/service-orders',
      async (context) => createServiceOrderHandler(context),
      createServiceOrderRouteSchema,
    );

    return app;
  },
);

app.get('/', ({ redirect }) => redirect('/swagger'), {
  detail: { hide: true },
});

if (import.meta.main) {
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000/swagger');
  });
}
