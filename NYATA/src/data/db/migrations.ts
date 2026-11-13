/** Minimal migration contract. The concrete Expo SQLite adapter can implement this
 * with a transaction and the same numbered SQL files used in development builds. */
export type SqlExecutor = { execAsync(sql: string): Promise<void> };

export type Migration = { version: number; sql: string };

export async function applyMigrations(db: SqlExecutor, migrations: Migration[]): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL);');
  for (const migration of [...migrations].sort((a, b) => a.version - b.version)) {
    await db.execAsync('BEGIN;');
    try {
      await db.execAsync(migration.sql);
      await db.execAsync(`INSERT INTO schema_migrations(version) SELECT ${migration.version} WHERE NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = ${migration.version});`);
      await db.execAsync('COMMIT;');
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  }
}

