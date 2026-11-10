import { Request, Response } from 'express';
import { pool } from '../config/db';
import {
  getClergyHierarchyRank,
  isVicarRecord,
  normalizeClergyRoleAndDesignation,
} from './clergy-controller';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

const defaultDisplayOrderFor = (roleType: string, designation: string): number => {
  const rank = getClergyHierarchyRank({ role_type: roleType, designation });
  if (rank === 0) return 1;
  if (rank === 1) return 2;
  if (rank === 2) return 10;
  if (rank === 3) return 15;
  return 20;
};

/**
 * POST /api/admin/clergy
 * Creates a new clergy directory record in PostgreSQL.
 */
export const createClergy = async (req: Request, res: Response): Promise<any> => {
  const { name, role_type, role, title, designation, address, bio, email, phone_number, phone, blood_group, house_id, display_order } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const { roleType, designation: desig } = normalizeClergyRoleAndDesignation(
    role_type || role || 'Resident Priest',
    designation || title
  );
  const addr = address || bio || null;
  const ph = phone_number || phone || null;

  const photoUrl =
    req.file?.path ||
    (req.file as any)?.secure_url ||
    req.body.avatarUrl ||
    req.body.avatar_url ||
    req.body.photoUrl ||
    req.body.photo_url ||
    null;

  let avatar_url: string | null = photoUrl;
  if (req.file && !avatar_url?.startsWith('http') && req.file.filename) {
    avatar_url = `/uploads/clergy-avatars/${req.file.filename}`;
  }

  const parsedHouseId = parseId(house_id);
  const parsedOrder =
    display_order !== undefined && !isNaN(Number(display_order))
      ? Number(display_order)
      : defaultDisplayOrderFor(roleType, desig);

  try {
    const result = await pool.query(
      `INSERT INTO clergy_directory (
         name, role_type, designation, address, email, phone_number, blood_group, avatar_url, house_id, display_order
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *, id as _id`,
      [name.trim(), roleType, desig, addr, email || null, ph, blood_group || null, avatar_url, parsedHouseId, parsedOrder]
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
 * Guards against demoting the sole active Vicar without another Vicar in place.
 */
export const updateClergy = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  const { name, role_type, role, title, designation, address, bio, email, phone_number, phone, blood_group, house_id, display_order } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  try {
    const existingResult = await pool.query('SELECT * FROM clergy_directory WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clergy record not found.' });
    }
    const existing = existingResult.rows[0];

    const { roleType, designation: desig } = normalizeClergyRoleAndDesignation(
      role_type || role || existing.role_type || 'Resident Priest',
      designation || title || role || role_type || existing.designation
    );

    // Enforce Vicar head-of-parish safeguard on role changes
    if (isVicarRecord(existing) && !isVicarRecord({ role_type: roleType, designation: desig })) {
      const othersRes = await pool.query('SELECT id, role_type, designation FROM clergy_directory WHERE id != $1', [id]);
      const anotherVicarExists = (othersRes.rows || []).some(isVicarRecord);
      if (!anotherVicarExists) {
        return res.status(409).json({
          error: 'Warning: A parish must have a designated Vicar as its head. Assign or promote another Vicar before reassigning the active Vicar.',
          code: 'VICAR_REQUIRED',
        });
      }
    }

    const addr = address !== undefined ? address : (bio !== undefined ? bio : existing.address);
    const ph = phone_number !== undefined ? phone_number : (phone !== undefined ? phone : existing.phone_number);

    const photoUrl =
      req.file?.path ||
      (req.file as any)?.secure_url ||
      req.body.avatarUrl ||
      req.body.avatar_url ||
      req.body.photoUrl ||
      req.body.photo_url ||
      existing.avatar_url ||
      null;

    let avatar_url = photoUrl;
    if (req.file && !avatar_url?.startsWith('http') && req.file.filename) {
      avatar_url = `/uploads/clergy-avatars/${req.file.filename}`;
    }

    const parsedHouseId = house_id !== undefined ? parseId(house_id) : existing.house_id;
    const parsedOrder =
      display_order !== undefined && !isNaN(Number(display_order))
        ? Number(display_order)
        : defaultDisplayOrderFor(roleType, desig);

    const result = await pool.query(
      `UPDATE clergy_directory SET
         name = $1, role_type = $2, designation = $3, address = $4,
         email = $5, phone_number = $6, blood_group = $7, avatar_url = $8, house_id = $9, display_order = $10
       WHERE id = $11
       RETURNING *, id as _id`,
      [name.trim(), roleType, desig, addr || null, email || null, ph || null, blood_group || null, avatar_url, parsedHouseId, parsedOrder, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating clergy:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/admin/clergy/:id
 * Deletes a clergy directory record, preventing deletion of the sole active Vicar.
 */
export const deleteClergy = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  try {
    const existingResult = await pool.query('SELECT * FROM clergy_directory WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clergy record not found.' });
    }
    const existing = existingResult.rows[0];

    if (isVicarRecord(existing)) {
      const othersRes = await pool.query('SELECT id, role_type, designation FROM clergy_directory WHERE id != $1', [id]);
      const anotherVicarExists = (othersRes.rows || []).some(isVicarRecord);
      if (!anotherVicarExists) {
        return res.status(409).json({
          error: 'Warning: A parish must have a designated Vicar as its head.',
          code: 'VICAR_REQUIRED',
        });
      }
    }

    await pool.query('DELETE FROM clergy_directory WHERE id = $1 RETURNING id', [id]);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting clergy:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
