import { Request, Response } from 'express';
import { Clergy } from '../models';

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
 * Returns the database results as a clean JSON array sorted by id ascendingly.
 */
export const getClergy = async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await Clergy.find().sort({ display_order: 1, _id: 1 });
    res.status(200).json(list);
  } catch (error) {
    console.error('Error fetching clergy directory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
