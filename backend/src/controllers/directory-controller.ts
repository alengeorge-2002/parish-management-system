import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

/**
 * Searches the parish directory executing joins across parishioners (members), families, and wards.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, wardId, search: searchQuery } = req.query;
    const rawSearch = (searchQuery as string || '').trim().toLowerCase();

    let sql = `
      SELECT 
        p.id as member_id,
        p.id as _id,
        p.first_name,
        p.last_name,
        p.phone_number as member_phone,
        p.email as member_email,
        p.relationship_role,
        p.is_head_of_household,
        p.dob,
        p.dom,
        p.occupation,
        p.blood_group,
        f.id as family_id,
        f.family_name,
        f.head_of_family,
        f.house_name,
        f.home_address,
        f.family_photo_url,
        f.contact_number as family_phone,
        f.reg_no,
        f.email as family_email,
        f.unit_number,
        w.id as ward_id,
        w.ward_name
      FROM members p
      LEFT JOIN families f ON p.family_id = f.id
      LEFT JOIN wards w ON f.ward_id = w.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (rawSearch) {
      params.push(`%${rawSearch}%`);
      const idx = params.length;
      sql += ` AND (
        LOWER(p.first_name) LIKE $${idx} OR
        LOWER(p.last_name) LIKE $${idx} OR
        LOWER(COALESCE(p.blood_group, '')) LIKE $${idx} OR
        LOWER(COALESCE(f.house_name, '')) LIKE $${idx} OR
        LOWER(COALESCE(f.family_name, '')) LIKE $${idx}
      )`;
    } else {
      if (firstName && typeof firstName === 'string' && firstName.trim() !== '') {
        params.push(`%${firstName.trim().toLowerCase()}%`);
        sql += ` AND LOWER(p.first_name) LIKE $${params.length}`;
      }
      if (lastName && typeof lastName === 'string' && lastName.trim() !== '') {
        params.push(`%${lastName.trim().toLowerCase()}%`);
        sql += ` AND LOWER(p.last_name) LIKE $${params.length}`;
      }
      if (phone && typeof phone === 'string' && phone.trim() !== '') {
        params.push(`%${phone.trim().toLowerCase()}%`);
        const idx = params.length;
        sql += ` AND (
          LOWER(COALESCE(p.phone_number, '')) LIKE $${idx} OR
          LOWER(COALESCE(f.contact_number, '')) LIKE $${idx}
        )`;
      }
      const wId = parseId(wardId);
      if (wId) {
        params.push(wId);
        sql += ` AND f.ward_id = $${params.length}`;
      }
    }

    sql += ` ORDER BY p.last_name ASC, p.first_name ASC`;
    const result = await pool.query(sql, params);

    const results = result.rows.map((row: any) => ({
      member_id: String(row.member_id),
      _id: String(row.member_id),
      id: String(row.member_id),
      first_name: row.first_name,
      last_name: row.last_name,
      member_phone: row.member_phone,
      member_email: row.member_email,
      relationship_role: row.relationship_role,
      is_head_of_household: row.is_head_of_household,
      dob: row.dob,
      dom: row.dom,
      occupation: row.occupation,
      blood_group: row.blood_group,
      family_id: row.family_id ? String(row.family_id) : null,
      family_name: row.family_name || row.house_name || '',
      head_of_family: row.head_of_family,
      house_name: row.house_name || '',
      home_address: row.home_address || '',
      family_photo_url: row.family_photo_url,
      family_phone: row.family_phone,
      reg_no: row.reg_no,
      family_email: row.family_email,
      unit_number: row.unit_number || '',
      ward_id: row.ward_id ? String(row.ward_id) : null,
      ward_name: row.ward_name || '',
    }));

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Directory search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
