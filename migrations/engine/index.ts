import { createMigrationTable } from './create-migration-table';
import { existsMigrationTable } from './exists-migration-table';
import { readDatabaseMigrations, readLocalMigrations } from './read-migrations';
import { runPendingMigrations } from './run-pending';

type Migration = { version: string; name: string };

const migrationKey = (migration: Migration) =>
  `${migration.version}_${migration.name}`;

export const runMigrations = async () => {
  const migrationTableExists = await existsMigrationTable();

  if (!migrationTableExists) await createMigrationTable();

  const [localMigrations, dbMigrations] = await Promise.all([
    readLocalMigrations(),
    readDatabaseMigrations(),
  ]);

  const localMigrationKeys = new Set(localMigrations.map(migrationKey));
  const dbMigrationKeys = new Set(dbMigrations.map(migrationKey));

  const dbMigrationsMissingLocally = dbMigrations.filter(
    (dbMigration) => !localMigrationKeys.has(migrationKey(dbMigration)),
  );

  if (dbMigrationsMissingLocally.length !== 0)
    throw new Error(
      `Database migrations missing locally. Consider creating or deleting on database migrations system:\nMigrations Missing: ${dbMigrationsMissingLocally.map((dbMigrationMissingLocally) => dbMigrationMissingLocally.name)}`,
    );

  const dbMigrationsMissing = localMigrations.filter(
    (localMigration) => !dbMigrationKeys.has(migrationKey(localMigration)),
  );

  if (dbMigrationsMissing.length !== 0) {
    console.log(
      `Running pending migrations: ${dbMigrationsMissing.map((dbMigrationMissing) => dbMigrationMissing.name)}`,
    );

    await runPendingMigrations(dbMigrationsMissing);
  }

  console.log('Migrations runned successfuly');
};

if (import.meta.main) {
  await runMigrations();
}
