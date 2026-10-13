import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB, pool } from './config/db';
import fs from 'fs';
import path from 'path';

const port = process.env.PORT || 5000;

// Auto-initialize PostgreSQL database connection and tables
export const autoInitializeDb = async () => {
  try {
    await connectDB();

    // 1. Ensure wards schema and columns are aligned
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wards (
        id SERIAL PRIMARY KEY,
        ward_name VARCHAR(100) UNIQUE NOT NULL,
        ward_number INTEGER,
        ward_prefix VARCHAR(50) DEFAULT 'W',
        total_units INT DEFAULT 0,
        representative_name VARCHAR(150),
        contact_phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE wards ADD COLUMN IF NOT EXISTS ward_number INTEGER;
      ALTER TABLE wards ADD COLUMN IF NOT EXISTS ward_prefix VARCHAR(50) DEFAULT 'W';
      ALTER TABLE wards ADD COLUMN IF NOT EXISTS total_units INT DEFAULT 0;
      ALTER TABLE wards ADD COLUMN IF NOT EXISTS representative_name VARCHAR(150);
      ALTER TABLE wards ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_wards_ward_name ON wards(ward_name);
    `);

    // 2. Safe seed query for wards with ON CONFLICT DO NOTHING
    await pool.query(`
      INSERT INTO wards (ward_name, ward_number, total_units, representative_name, contact_phone)
      VALUES 
        ('St. Jude Ward', 1, 4, 'Varghese Mathew', '+91 94471 00001'),
        ('St. Mary Ward', 2, 3, 'Joseph Kuriakose', '+91 94471 00002'),
        ('St. Joseph Ward', 3, 5, 'Thomas George', '+91 94471 00003')
      ON CONFLICT (ward_name) DO NOTHING;
    `);

    // 3. Execute init.sql to ensure all other tables, constraints, and initial seed records exist
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
