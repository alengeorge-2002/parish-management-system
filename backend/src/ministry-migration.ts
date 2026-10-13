/**
 * Legacy MongoDB ministry migration script.
 * In PostgreSQL, schema setup and initial seeding is managed via db/init.sql.
 */
export const runMinistryMigration = async (): Promise<void> => {
  console.log('runMinistryMigration: Migrations are now managed via PostgreSQL db/init.sql.');
};

export default runMinistryMigration;
