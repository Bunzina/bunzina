import { db } from './config/database';

export const runPendingMigrations = async (
  migrations: { name: string; version: string }[],
) => {
  await db.transaction(async (sql) => {
    const migrationsToRunPromises = migrations.map(async (migration) => {
      const fileNameWithoutExtension = `${migration.version}-${migration.name}`;
      await sql.file(`./migrations/${fileNameWithoutExtension}.sql`);
      await sql`INSERT INTO public.migrations (name) VALUES (${fileNameWithoutExtension})`;
    });

    await Promise.all(migrationsToRunPromises);
  });
};
