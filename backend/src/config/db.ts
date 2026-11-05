import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/devagiri_parish_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const connectDB = async (): Promise<Pool> => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected successfully via connection pool.');

    // Ensure critical columns exist in Neon PostgreSQL
    try {
      await client.query(`
        ALTER TABLE members ADD COLUMN IF NOT EXISTS is_directory_visible BOOLEAN DEFAULT true;
        ALTER TABLE members ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'parishioner';
        ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
        ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        ALTER TABLE announcements ADD COLUMN IF NOT EXISTS poster_url TEXT;
        ALTER TABLE announcements ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;
      `);
    } catch (e) {
      console.warn('Schema check warning:', e);
    }

    client.release();
    return pool;
  } catch (error) {
    console.error('PostgreSQL Connection error:', error);
    throw error;
  }
};

export default pool;
