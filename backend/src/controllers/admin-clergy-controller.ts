import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

/**
 * POST /api/admin/clergy
 * Creates a new clergy directory record in PostgreSQL.
 */
export const createClergy = async (req: Request, res: Response): Promise<any> => {
  const { name, role_type, role, title, designation, address, bio, email, phone_number, phone, blood_group, house_id } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const roleType = role_type || role || title || 'Vicar';
  const desig = designation || title || roleType;
  const addr = address || bio || null;
  const ph = phone_number || phone || null;

  let avatar_url: string | null = null;
  if (req.file) {
    avatar_url = `/uploads/clergy-avatars/${req.file.filename}`;
  } else if (req.body.avatarUrl) {
    avatar_url = req.body.avatarUrl;
  } else if (req.body.avatar_url) {
    avatar_url = req.body.avatar_url;
  }

  const parsedHouseId = parseId(house_id);

  try {
    const result = await pool.query(
      `INSERT INTO clergy_directory (
         name, role_type, designation, address, email, phone_number, blood_group, avatar_url, house_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *, id as _id`,
      [name.trim(), roleType, desig, addr, email || null, ph, blood_group || null, avatar_url, parsedHouseId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating clergy:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * PUT /api/admin/clergy/:id
 * Updates an existing clergy directory record in PostgreSQL.
 */
export const updateClergy = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  const { name, role_type, role, title, designation, address, bio, email, phone_number, phone, blood_group, house_id } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const roleType = role_type || role || title || 'Vicar';
  const desig = designation || title || roleType;
  const addr = address || bio || null;
  const ph = phone_number || phone || null;

  try {
    const existingResult = await pool.query('SELECT * FROM clergy_directory WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clergy record not found.' });
    }
    const existing = existingResult.rows[0];

    let avatar_url = existing.avatar_url || null;
    if (req.file) {
      avatar_url = `/uploads/clergy-avatars/${req.file.filename}`;
    } else if (req.body.avatarUrl) {
      avatar_url = req.body.avatarUrl;
    } else if (req.body.avatar_url) {
      avatar_url = req.body.avatar_url;
    }

    const parsedHouseId = house_id !== undefined ? parseId(house_id) : existing.house_id;

    const result = await pool.query(
      `UPDATE clergy_directory SET
         name = $1, role_type = $2, designation = $3, address = $4,
         email = $5, phone_number = $6, blood_group = $7, avatar_url = $8, house_id = $9
       WHERE id = $10
       RETURNING *, id as _id`,
      [name.trim(), roleType, desig, addr, email || null, ph, blood_group || null, avatar_url, parsedHouseId, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating clergy:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/admin/clergy/:id
 * Deletes a clergy directory record.
 */
export const deleteClergy = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  try {
    const result = await pool.query('DELETE FROM clergy_directory WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clergy record not found.' });
    }
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting clergy:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
