import { createMigrationTable } from './createMigrationTable';
import { existsMigrationTable } from './existsMigrationTable';
import { readDatabaseMigrations, readLocalMigrations } from './readMigrations';
import { runPendingMigrations } from './runPendingMigrations';

const execute = async () => {
  const migrationTableExists = await existsMigrationTable();

  if (!migrationTableExists) await createMigrationTable();

  const localMigrations = await readLocalMigrations();
  const dbMigrations = await readDatabaseMigrations();

  const localMigrationsMissing = dbMigrations.filter(
    (dbMigration) => !localMigrations.includes(dbMigration),
  );

  if (localMigrationsMissing.length !== 0)
    throw new Error(
      `Local Migration missing. Consider creating or deleting on database migrations system:\nMigrations Missing: ${localMigrationsMissing.map((localMigrationMissing) => localMigrationMissing.name)}`,
    );

  const dbMigrationsMissing = localMigrations.filter(
    (localMigration) => !dbMigrations.includes(localMigration),
  );

  if (dbMigrationsMissing.length !== 0) {
    console.log(
      `Running pending migrations: ${dbMigrationsMissing.map((dbMigrationMissing) => dbMigrationMissing.name)}`,
    );

    await runPendingMigrations(dbMigrationsMissing);
  }

  console.log('Migrations runned successfuly');
};

execute();
