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
    client.release();
    return pool;
  } catch (error) {
    console.error('PostgreSQL Connection error:', error);
    throw error;
  }
};

export default pool;
