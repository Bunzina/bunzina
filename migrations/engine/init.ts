import { db } from './config/database';

const initMigrationSystem = async () => {
  try{
    const [record] = await db<{to_regclass: string}[]>`
      SELECT to_regclass('public.migrations');
    `;
    
    const migrationTableExists = !!record?.to_regclass;

    if(migrationTableExists) return;

    await db.file('./migrations/engine/init_system_migration.sql');
  }catch(error) {
    console.log(error)
  }finally {
    await db.close()
  }

};

initMigrationSystem();