/**
 * Legacy MongoDB parish council migration script.
 * In PostgreSQL, schema setup and initial seeding is managed via db/init.sql.
 */
export const runParishCouncilMigration = async (): Promise<void> => {
  console.log('runParishCouncilMigration: Migrations are now managed via PostgreSQL db/init.sql.');
};

export default runParishCouncilMigration;
