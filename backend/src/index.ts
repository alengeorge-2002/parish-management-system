import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB, pool } from './config/db';
import fs from 'fs';
import path from 'path';

const port = process.env.PORT || 5000;

// Auto-initialize PostgreSQL database connection and tables
const autoInitializeDb = async () => {
  try {
    await connectDB();

    // Execute init.sql to ensure all tables, constraints, and initial seed records exist
    const candidatePaths = [
      path.join(process.cwd(), 'db/init.sql'),
      path.join(process.cwd(), 'backend/db/init.sql'),
      path.join(__dirname, '../db/init.sql'),
      path.join(__dirname, '../../db/init.sql'),
    ];
    const initSqlPath = candidatePaths.find((p) => fs.existsSync(p));
    if (initSqlPath) {
      const initSql = fs.readFileSync(initSqlPath, 'utf8');
      await pool.query(initSql);
      console.log('PostgreSQL schema auto-initialization completed successfully.');
    }
  } catch (err) {
    console.warn('Database auto-initialization notice:', err);
  }
};

autoInitializeDb();

// Wrap app.listen conditional check for local development vs serverless execution
if (process.env.NODE_ENV !== 'production' || !process.env.AWS_EXECUTION_ENV) {
  app.listen(port, () => {
    console.log(`Local development server running on port ${port}`);
  });
}

export default app;
