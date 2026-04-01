import swagger from '@elysiajs/swagger';
import Elysia, { type Context } from 'elysia';
import { createCustomerHandler } from './handlers/customer/create';

const app = new Elysia();

app.use(swagger());

app.get('/', () => 'Hello World!');

app.post('/customers', async (context: Context) => {
  return await createCustomerHandler(context);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
