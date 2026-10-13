/**
 * Legacy MongoDB clergy directory migration script.
 * In PostgreSQL, schema setup and initial seeding is managed via db/init.sql.
 */
export const runClergyMigration = async (): Promise<void> => {
  console.log('runClergyMigration: Migrations are now managed via PostgreSQL db/init.sql.');
};

export default runClergyMigration;
