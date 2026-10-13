/**
 * Legacy MongoDB schema migration & seeding script.
 * In PostgreSQL, schema setup and initial seeding is managed via db/init.sql.
 */
export const runGeneralDbMigration = async (): Promise<void> => {
  console.log('runGeneralDbMigration: Migrations are now managed via PostgreSQL db/init.sql.');
};

export default runGeneralDbMigration;
