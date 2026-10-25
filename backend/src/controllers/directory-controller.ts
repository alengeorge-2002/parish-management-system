import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

/**
 * Searches the parish directory executing joins across visible parishioners (members), families, and wards.
 * Strictly filters by is_directory_visible = true AND role = 'parishioner'
 * and excludes administrative / system accounts.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, wardId, search: searchQuery, format } = req.query;
    const rawSearch = (searchQuery as string || '').trim().toLowerCase();

    let sql = `
      SELECT 
        p.id as member_id,
        p.id as _id,
        p.id,
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
        p.is_directory_visible,
        p.role,
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
      WHERE COALESCE(p.is_directory_visible, true) = true
        AND COALESCE(p.role, 'parishioner') = 'parishioner'
        AND NOT EXISTS (
          SELECT 1 FROM app_users au WHERE au.member_id = p.id AND au.role = 'admin'
        )
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
      role: row.role || 'parishioner',
      is_directory_visible: row.is_directory_visible !== false,
    }));

    if (format === 'array') {
      res.status(200).json(results);
      return;
    }

    res.status(200).json({
      count: results.length,
      results,
      data: results,
      members: results,
    });
  } catch (error) {
    console.error('Directory search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Returns families that contain visible directory parishioners.
 */
export const getDirectoryFamilies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT f.*,
        json_build_object(
          'id', w.id,
          '_id', w.id,
          'ward_name', w.ward_name,
          'wardName', w.ward_name,
          'ward_number', w.ward_number,
          'wardNumber', w.ward_number
        ) as ward,
        (
          SELECT count(*)::int FROM members m 
          WHERE m.family_id = f.id 
            AND COALESCE(m.is_directory_visible, true) = true 
            AND COALESCE(m.role, 'parishioner') = 'parishioner'
            AND NOT EXISTS (SELECT 1 FROM app_users au WHERE au.member_id = m.id AND au.role = 'admin')
        ) as member_count
      FROM families f
      LEFT JOIN wards w ON f.ward_id = w.id
      WHERE EXISTS (
        SELECT 1 FROM members m 
        WHERE m.family_id = f.id 
          AND COALESCE(m.is_directory_visible, true) = true 
          AND COALESCE(m.role, 'parishioner') = 'parishioner'
          AND NOT EXISTS (SELECT 1 FROM app_users au WHERE au.member_id = m.id AND au.role = 'admin')
      )
      ORDER BY f.family_name ASC
    `);

    const mapped = result.rows.map((row: any) => ({
      ...row,
      id: String(row.id),
      _id: String(row.id),
      familyName: row.family_name,
      family_name: row.family_name,
      houseName: row.house_name,
      house_name: row.house_name,
      headOfFamily: row.head_of_family,
      head_of_family: row.head_of_family,
      homeAddress: row.home_address,
      home_address: row.home_address,
      contactNumber: row.contact_number,
      contact_number: row.contact_number,
      unitNumber: row.unit_number,
      unit_number: row.unit_number,
      wardId: row.ward_id ? String(row.ward_id) : null,
      ward_id: row.ward_id ? String(row.ward_id) : null,
      wardName: row.ward?.ward_name || '',
      ward_name: row.ward?.ward_name || '',
    }));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching directory families' });
  }
};

/**
 * Returns all active wards for directory lookup.
 */
export const getDirectoryWards = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT w.*,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', u.id,
              '_id', u.id,
              'unit_number', u.unit_number,
              'unit_name', u.unit_name,
              'representative_name', u.representative_name,
              'representative_phone', u.representative_phone
            )
          ) FROM units u WHERE u.ward_id = w.id
        ), '[]'::json) as units,
        (
          SELECT count(DISTINCT f.id)::int FROM families f 
          WHERE f.ward_id = w.id
            AND EXISTS (
              SELECT 1 FROM members m 
              WHERE m.family_id = f.id 
                AND COALESCE(m.is_directory_visible, true) = true 
                AND COALESCE(m.role, 'parishioner') = 'parishioner'
                AND NOT EXISTS (SELECT 1 FROM app_users au WHERE au.member_id = m.id AND au.role = 'admin')
            )
        ) as family_count
      FROM wards w
      ORDER BY w.ward_number ASC, w.ward_name ASC
    `);

    const mapped = result.rows.map((w: any) => ({
      ...w,
      id: String(w.id),
      _id: String(w.id),
      wardNumber: w.ward_number || w.id,
      ward_number: w.ward_number || w.id,
      wardName: w.ward_name,
      ward_name: w.ward_name,
      patron: w.ward_name,
      total_units: w.total_units || (Array.isArray(w.units) ? w.units.length : 0),
    }));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching directory wards' });
  }
};
