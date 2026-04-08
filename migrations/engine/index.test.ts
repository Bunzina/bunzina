import { describe, expect, mock, test } from 'bun:test';

describe('migration engine index', () => {
  test('should create migration table and run pending migrations', async () => {
    const createMigrationTableMock = mock(() => Promise.resolve(undefined));
    const existsMigrationTableMock = mock(() => Promise.resolve(true));
    const readLocalMigrationsMock = mock(() =>
      Promise.resolve([] as { version: string; name: string }[]),
    );
    const readDatabaseMigrationsMock = mock(() =>
      Promise.resolve([] as { version: string; name: string }[]),
    );
    const runPendingMigrationsMock = mock(() => Promise.resolve(undefined));

    mock.module('./create-migration-table', () => ({
      createMigrationTable: createMigrationTableMock,
    }));

    mock.module('./exists-migration-table', () => ({
      existsMigrationTable: existsMigrationTableMock,
    }));

    mock.module('./read-migrations', () => ({
      readLocalMigrations: readLocalMigrationsMock,
      readDatabaseMigrations: readDatabaseMigrationsMock,
    }));

    mock.module('./run-pending', () => ({
      runPendingMigrations: runPendingMigrationsMock,
    }));

    const { runMigrations } = await import(`./index.ts?test=${Math.random()}`);

    try {
      existsMigrationTableMock.mockResolvedValueOnce(false);
      readLocalMigrationsMock.mockResolvedValueOnce([
        { version: '001', name: 'create_schema_and_enums' },
        { version: '002', name: 'create_customers' },
      ]);
      readDatabaseMigrationsMock.mockResolvedValueOnce([
        { version: '001', name: 'create_schema_and_enums' },
      ]);

      await runMigrations();

      expect(createMigrationTableMock).toHaveBeenCalledTimes(1);
      expect(runPendingMigrationsMock).toHaveBeenCalledWith([
        { version: '002', name: 'create_customers' },
      ]);
    } finally {
      mock.restore();
    }
  });

  test('should throw error when local migrations is missing', async () => {
    const createMigrationTableMock = mock(() => Promise.resolve(undefined));
    const existsMigrationTableMock = mock(() => Promise.resolve(true));
    const readLocalMigrationsMock = mock(() =>
      Promise.resolve([] as { version: string; name: string }[]),
    );
    const readDatabaseMigrationsMock = mock(() =>
      Promise.resolve([] as { version: string; name: string }[]),
    );
    const runPendingMigrationsMock = mock(() => Promise.resolve(undefined));

    mock.module('./create-migration-table', () => ({
      createMigrationTable: createMigrationTableMock,
    }));

    mock.module('./exists-migration-table', () => ({
      existsMigrationTable: existsMigrationTableMock,
    }));

    mock.module('./read-migrations', () => ({
      readLocalMigrations: readLocalMigrationsMock,
      readDatabaseMigrations: readDatabaseMigrationsMock,
    }));

    mock.module('./run-pending', () => ({
      runPendingMigrations: runPendingMigrationsMock,
    }));

    const { runMigrations } = await import(`./index.ts?test=${Math.random()}`);

    try {
      existsMigrationTableMock.mockResolvedValueOnce(false);
      readLocalMigrationsMock.mockResolvedValueOnce([
        { version: '002', name: 'create_customers' },
      ]);
      readDatabaseMigrationsMock.mockResolvedValueOnce([
        { version: '001', name: 'create_schema_and_enums' },
      ]);

      await expect(runMigrations()).rejects.toThrow();

      expect(createMigrationTableMock).toHaveBeenCalledTimes(1);
      expect(runPendingMigrationsMock).not.toHaveBeenCalled();
    } finally {
      mock.restore();
    }
  });
});
