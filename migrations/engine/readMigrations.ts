import { readdir } from 'node:fs/promises';
import { db } from './config/database';

export const readFolderMigrations = async () => {
  const files = await readdir('./migrations');

  return files.filter((file) => file.endsWith('.sql')).map((file) => file.split('.')[0]);
};

export const readDatabaseMigrations = async () => {
  const migrations = await db<{ name: string }[]>`
    SELECT m.name FROM bunzina.migrations m
    ORDER m.runned_at
  `;

  console.log(migrations);
};

readDatabaseMigrations();
