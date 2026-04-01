import swagger from '@elysiajs/swagger';
import Elysia from 'elysia';

const app = new Elysia();

app.use(swagger());
app.get('/', () => 'Hello World!');

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
