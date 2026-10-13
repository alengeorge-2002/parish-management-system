import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export interface ClergyRecord {
  id: string;
  name: string;
  role_type: string;
  designation: string | null;
  address: string | null;
  email: string | null;
  phone_number: string | null;
  blood_group: string | null;
  avatar_url: string | null;
  house_id: string | null;
}

/**
 * GET /api/directory/clergy
 * Returns all clergy directory records from PostgreSQL.
 */
export const getClergy = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT *, id as _id FROM clergy_directory ORDER BY display_order ASC, id ASC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching clergy directory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
