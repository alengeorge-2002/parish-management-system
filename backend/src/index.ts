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

    // 2b. Ensure units schema and columns are aligned
    await pool.query(`
      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        unit_number VARCHAR(50) NOT NULL,
        unit_name VARCHAR(150),
        representative_name VARCHAR(150),
        representative_phone VARCHAR(50),
        ward_id INT NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'name') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'unit_name') THEN
          ALTER TABLE units RENAME COLUMN name TO unit_name;
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'units' AND column_name = 'unit_number' AND data_type IN ('integer', 'smallint', 'bigint')
        ) THEN
          ALTER TABLE units ALTER COLUMN unit_number TYPE VARCHAR(50) USING unit_number::varchar;
        END IF;
      END $$;
      ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_number VARCHAR(50);
      ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_name VARCHAR(150);
      ALTER TABLE units ADD COLUMN IF NOT EXISTS representative_name VARCHAR(150);
      ALTER TABLE units ADD COLUMN IF NOT EXISTS representative_phone VARCHAR(50);
    `);

    await pool.query(`
      INSERT INTO units (unit_number, unit_name, ward_id)
      VALUES 
        ('101', 'Unit 101', 1),
        ('202', 'Unit 202', 2),
        ('5', 'Unit 5', 3)
      ON CONFLICT DO NOTHING;
    `).catch(() => {});

    // 3. Ensure clergy_directory schema and display_order column are aligned
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clergy_directory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role_type VARCHAR(100) NOT NULL,
        designation VARCHAR(255),
        address TEXT,
        email VARCHAR(255),
        phone_number VARCHAR(100),
        blood_group VARCHAR(50),
        avatar_url VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        is_quick_contact BOOLEAN DEFAULT false,
        house_id INT
      );
      ALTER TABLE clergy_directory ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
      ALTER TABLE clergy_directory ADD COLUMN IF NOT EXISTS is_quick_contact BOOLEAN DEFAULT false;
      ALTER TABLE clergy_directory ADD COLUMN IF NOT EXISTS house_id INT;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_clergy_directory_name ON clergy_directory(name);
    `);

    // 4. Safe seed query for clergy_directory with ON CONFLICT DO NOTHING
    await pool.query(`
      INSERT INTO clergy_directory (name, role_type, designation, address, email, phone_number, blood_group, avatar_url, display_order)
      VALUES
        ('Rev. Fr. Joseph Mathew', 'parish-priest', 'Vicar', NULL, 'pp.stjosephdevagiri@gmail.com', '+91 98450 00001', 'O+', NULL, 1),
        ('Rev. Fr. George Varghese', 'parish-priest', 'Associate Pastor', NULL, 'assoc.stjosephdevagiri@gmail.com', '+91 98450 00002', 'O+', NULL, 2),
        ('Sr. Anitha Thomas', 'sister', 'School Principal', 'CMC', NULL, '+91 98450 00003', 'O+', NULL, 3),
        ('Sr. Mary Joseph', 'sister', 'Social Service Wing', 'CMI', NULL, '+91 98450 00004', 'O+', NULL, 4)
      ON CONFLICT (name) DO NOTHING;
    `);

    // 5. Execute init.sql to ensure all other tables, constraints, and initial seed records exist
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
