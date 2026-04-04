import { readdir } from 'node:fs/promises';
import { db } from './config/database';

export const readLocalMigrations = async () => {
  const files = await readdir('./migrations');

  const localMigrations = files
    .filter((file) => file.endsWith('.sql'))
    .map((file) => {
      const fileNameWithoutExtension = file.split('.')[0];

      if (!fileNameWithoutExtension) return null;

      return {
        version: fileNameWithoutExtension.slice(0, 3),
        name: fileNameWithoutExtension.slice(4),
      };
    });

  return removeNullValues(localMigrations);
};

export const readDatabaseMigrations = async () => {
  const migrations = await db<{ name: string }[]>`
    SELECT m.name FROM public.migrations m
    ORDER BY m.runned_at
  `;

  return removeNullValues(
    migrations.map((migration) => ({
      version: migration.name.slice(0, 3),
      name: migration.name.slice(4),
    })),
  );
};

const removeNullValues = (
  migrations: ({ version: string; name: string } | null)[],
) => {
  return migrations.filter(
    (migration): migration is { version: string; name: string } =>
      migration !== null,
  );
};
