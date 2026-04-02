import swagger from '@elysiajs/swagger';
import Elysia from 'elysia';
import { createCustomerHandler } from './handlers/customer/create';
import { createCustomerSchema } from './handlers/customer/schema';
import { healthSchema } from './handlers/health/schema';

const app = new Elysia();

app.use(
  swagger({
    documentation: {
      info: { title: 'Bunzina API', version: '1.0.0' },
    },
  }),
);

app.get(
  '/health',
  () => new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }),
  healthSchema,
);

app.post(
  '/customers',
  async (context) => createCustomerHandler(context),
  createCustomerSchema,
);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
