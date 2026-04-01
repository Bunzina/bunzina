import { SQL } from 'bun';

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/bunzina';

export const db = new SQL(connectionString);
