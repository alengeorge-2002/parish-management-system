import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db';

let appUsersSchemaEnsured = false;
export const ensureAppUsersSchema = async () => {
  if (appUsersSchemaEnsured) return;
  try {
    await pool.query(`ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);`);
    appUsersSchemaEnsured = true;
  } catch (err) {
    console.warn('Could not ensure app_users schema:', err);
  }
};

/*** Helper to extract uploaded file ***/
const extractUploadedPhoto = (req: Request): string | null => {
  if (req.file) {
    return `/uploads/family-photos/${req.file.filename}`;
  }
  const filesAny = req.files as any;
  if (filesAny) {
    if (filesAny.familyPhoto && filesAny.familyPhoto[0]) {
      return `/uploads/family-photos/${filesAny.familyPhoto[0].filename}`;
    }
    if (filesAny.family_photo && filesAny.family_photo[0]) {
      return `/uploads/family-photos/${filesAny.family_photo[0].filename}`;
    }
  }
  return null;
};

const parseDate = (val: any) => {
  if (!val || val === '-' || val === 'null' || val === '') return null;
  return val;
};

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

/*** User Management ***/
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    await ensureAppUsersSchema();
    const result = await pool.query(
      `SELECT u.id, u.member_id, u.role, u.access_key, u.password_hash,
              m.first_name, m.last_name, m.email
       FROM app_users u
       LEFT JOIN members m ON u.member_id = m.id
       ORDER BY u.id ASC`
    );
    const mapped = result.rows.map((u: any) => ({
      id: String(u.id),
      _id: String(u.id),
      member_id: u.member_id ? String(u.member_id) : null,
      role: u.role,
      access_key: u.access_key,
      accessKey: u.access_key,
      has_password: Boolean(u.password_hash),
      first_name: u.first_name || (u.role === 'admin' ? 'Admin' : 'Parishioner'),
      last_name: u.last_name || 'User',
      email: u.email || (u.role === 'admin' ? 'admin@devagiriparish.com' : 'parishioner@devagiriparish.com'),
      status: 'active',
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching users' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    await ensureAppUsersSchema();
    const { memberId, role, accessKey, password } = req.body;
    const mId = parseId(memberId);
    if (!mId || !role) {
      return res.status(400).json({ error: 'memberId and role required' });
    }
    const finalAccessKey = accessKey || Math.random().toString(36).slice(2, 14);
    let passwordHash: string | null = null;
    if (password && typeof password === 'string' && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }
    const result = await pool.query(
      `INSERT INTO app_users (member_id, access_key, role, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [mId, finalAccessKey, role, passwordHash]
    );
    const row = result.rows[0];
    res.status(201).json({ ...row, id: String(row.id), _id: String(row.id) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating user' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    await ensureAppUsersSchema();
    const id = parseId(req.params.id);
    const { role, password, accessKey } = req.body;
    if (!id || (!role && !password && !accessKey)) {
      return res.status(400).json({ error: 'Valid id and role or password required' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (role) {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    if (accessKey && typeof accessKey === 'string' && accessKey.trim()) {
      updates.push(`access_key = $${paramIndex++}`);
      values.push(accessKey.trim());
    }
    if (password && typeof password === 'string' && password.trim()) {
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE app_users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const row = result.rows[0];
    res.json({ ...row, id: String(row.id), _id: String(row.id) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid id required' });
    await pool.query('DELETE FROM app_users WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting user' });
  }
};

let unitsSchemaEnsured = false;
export const ensureUnitsSchema = async () => {
  if (unitsSchemaEnsured) return;
  try {
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
    unitsSchemaEnsured = true;
  } catch (err: any) {
    console.error('ensureUnitsSchema notice:', err?.message || err);
  }
};

/*** Ward Management ***/
export const getAllWards = async (_req: Request, res: Response) => {
  try {
    // 1. Ensure units schema and columns exist safely
    await ensureUnitsSchema();

    // 2. Inspect available columns in units table for 100% resilient querying
    const colCheck = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'units'`
    ).catch(() => ({ rows: [] }));
    const cols = new Set(colCheck.rows.map((r: any) => r.column_name.toLowerCase()));

    // Safe column expressions based on active PostgreSQL schema
    const unitNameExpr = cols.has('unit_name')
      ? "COALESCE(u.unit_name, '')"
      : cols.has('name')
        ? "COALESCE(u.name, '')"
        : cols.has('title')
          ? "COALESCE(u.title, '')"
          : "''";
    const unitNumExpr = cols.has('unit_number')
      ? 'u.unit_number::text'
      : 'u.id::text';
    const repNameExpr = cols.has('representative_name')
      ? "COALESCE(u.representative_name, '')"
      : cols.has('rep_name')
        ? "COALESCE(u.rep_name, '')"
        : "''";
    const repPhoneExpr = cols.has('representative_phone')
      ? "COALESCE(u.representative_phone, '')"
      : cols.has('rep_phone')
        ? "COALESCE(u.rep_phone, '')"
        : "''";

    const result = await pool.query(
      `SELECT w.*,
         COALESCE(
           (SELECT json_agg(json_build_object(
             'id', u.id,
             '_id', u.id,
             'unitNumber', ${unitNumExpr},
             'unit_number', ${unitNumExpr},
             'unitName', ${unitNameExpr},
             'unit_name', ${unitNameExpr},
             'representativeName', ${repNameExpr},
             'representative_name', ${repNameExpr},
             'representativePhone', ${repPhoneExpr},
             'representative_phone', ${repPhoneExpr}
           )) FROM units u WHERE u.ward_id = w.id),
           '[]'::json
         ) as units,
         (SELECT count(*)::int FROM families f WHERE f.ward_id = w.id) as total_families
       FROM wards w
       ORDER BY COALESCE(w.ward_number, w.id) ASC`
    );

    const wards = result.rows.map((row: any) => {
      const mappedUnits = (row.units || []).map((u: any) => ({
        ...u,
        id: u?.id ? String(u.id) : undefined,
        _id: u?.id ? String(u.id) : undefined,
        unitNumber: u?.unitNumber ?? u?.unit_number ?? '',
        unit_number: u?.unitNumber ?? u?.unit_number ?? '',
        unitName: u?.unitName ?? u?.unit_name ?? '',
        unit_name: u?.unitName ?? u?.unit_name ?? '',
        representativeName: u?.representativeName ?? u?.representative_name ?? '',
        representative_name: u?.representativeName ?? u?.representative_name ?? '',
        representativePhone: u?.representativePhone ?? u?.representative_phone ?? '',
        representative_phone: u?.representativePhone ?? u?.representative_phone ?? '',
      }));

      return {
        ...row,
        id: String(row.id),
        _id: String(row.id),
        wardNumber: row.ward_number || row.id,
        ward_number: row.ward_number || row.id,
        wardName: row.ward_name,
        ward_name: row.ward_name,
        patron: row.ward_name,
        representativeName: row.representative_name || '',
        representative_name: row.representative_name || '',
        president: row.representative_name || '',
        contactPhone: row.contact_phone || '',
        contact_phone: row.contact_phone || '',
        phone: row.contact_phone || '',
        total_units: row.total_units || mappedUnits.length,
        totalUnits: row.total_units || mappedUnits.length,
        totalFamilies: row.total_families || 0,
        total_families: row.total_families || 0,
        units: mappedUnits,
      };
    });

    res.json(wards);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching wards' });
  }
};

export const createWard = async (req: Request, res: Response): Promise<any> => {
  try {
    const { wardName, ward_name, patron, wardNumber, ward_number, wardPrefix, ward_prefix, totalUnits, total_units, representativeName, representative_name, president, rep, contactPhone, contact_phone, phone } = req.body;
    const name = wardName || ward_name || patron;
    if (!name) return res.status(400).json({ error: 'wardName required' });

    const wNum = parseInt(String(wardNumber || ward_number || 1), 10);
    const prefix = wardPrefix || ward_prefix || 'W';
    const unitsCount = parseInt(String(totalUnits || total_units || 0), 10);
    const repName = representativeName || representative_name || president || rep || '';
    const phoneNum = contactPhone || contact_phone || phone || '';

    const result = await pool.query(
      `INSERT INTO wards (ward_name, ward_number, ward_prefix, total_units, representative_name, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, wNum, prefix, unitsCount, repName, phoneNum]
    );

    const row = result.rows[0];
    res.status(201).json({
      ...row,
      id: String(row.id),
      _id: String(row.id),
      wardNumber: row.ward_number,
      wardName: row.ward_name,
      units: [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating ward' });
  }
};

export const updateWard = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid id required' });

    const { wardName, ward_name, patron, wardNumber, ward_number, wardPrefix, ward_prefix, totalUnits, total_units, representativeName, representative_name, president, rep, contactPhone, contact_phone, phone } = req.body;
    const name = wardName || ward_name || patron;
    if (!name) return res.status(400).json({ error: 'wardName required' });

    const wNum = parseInt(String(wardNumber || ward_number || 1), 10);
    const prefix = wardPrefix || ward_prefix || 'W';
    const unitsCount = parseInt(String(totalUnits || total_units || 0), 10);
    const repName = representativeName || representative_name || president || rep || '';
    const phoneNum = contactPhone || contact_phone || phone || '';

    const result = await pool.query(
      `UPDATE wards SET
         ward_name = $1, ward_number = $2, ward_prefix = $3,
         total_units = $4, representative_name = $5, contact_phone = $6
       WHERE id = $7
       RETURNING *`,
      [name, wNum, prefix, unitsCount, repName, phoneNum, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Ward not found' });
    const row = result.rows[0];
    res.json({
      ...row,
      id: String(row.id),
      _id: String(row.id),
      wardNumber: row.ward_number,
      wardName: row.ward_name,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating ward' });
  }
};

export const deleteWard = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid id required' });
    await pool.query('DELETE FROM wards WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting ward' });
  }
};

export const addUnitToWard = async (req: Request, res: Response): Promise<any> => {
  try {
    const wardId = parseId(req.params.id);
    if (!wardId) return res.status(400).json({ message: 'Valid ward id required' });

    await ensureUnitsSchema();

    const unitNumber = String(req.body.unitNumber || req.body.unit_number || 'Unit 1');
    const unitName = req.body.unitName || req.body.unit_name || '';
    const repName = req.body.representativeName || req.body.representative_name || '';
    const repPhone = req.body.representativePhone || req.body.representative_phone || '';

    // Inspect available columns in units table
    const colCheck = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'units'`
    ).catch(() => ({ rows: [] }));
    const cols = new Set(colCheck.rows.map((r: any) => r.column_name.toLowerCase()));

    const insertCols: string[] = ['ward_id', 'unit_number'];
    const insertVals: any[] = [wardId, unitNumber];
    const placeholders: string[] = ['$1', '$2'];

    if (cols.has('unit_name')) {
      insertCols.push('unit_name');
      insertVals.push(unitName);
      placeholders.push(`$${insertVals.length}`);
    } else if (cols.has('name')) {
      insertCols.push('name');
      insertVals.push(unitName);
      placeholders.push(`$${insertVals.length}`);
    }

    if (cols.has('representative_name')) {
      insertCols.push('representative_name');
      insertVals.push(repName);
      placeholders.push(`$${insertVals.length}`);
    }

    if (cols.has('representative_phone')) {
      insertCols.push('representative_phone');
      insertVals.push(repPhone);
      placeholders.push(`$${insertVals.length}`);
    }

    await pool.query(
      `INSERT INTO units (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')})`,
      insertVals
    );

    await pool.query(
      `UPDATE wards SET total_units = (SELECT count(*)::int FROM units WHERE ward_id = $1) WHERE id = $1`,
      [wardId]
    );

    const unitNameExpr = cols.has('unit_name')
      ? "COALESCE(u.unit_name, '')"
      : cols.has('name')
        ? "COALESCE(u.name, '')"
        : cols.has('title')
          ? "COALESCE(u.title, '')"
          : "''";
    const unitNumExpr = cols.has('unit_number')
      ? 'u.unit_number::text'
      : 'u.id::text';
    const repNameExpr = cols.has('representative_name')
      ? "COALESCE(u.representative_name, '')"
      : cols.has('rep_name')
        ? "COALESCE(u.rep_name, '')"
        : "''";
    const repPhoneExpr = cols.has('representative_phone')
      ? "COALESCE(u.representative_phone, '')"
      : cols.has('rep_phone')
        ? "COALESCE(u.rep_phone, '')"
        : "''";

    const updated = await pool.query(
      `SELECT w.*,
         COALESCE(
           (SELECT json_agg(json_build_object(
             'id', u.id,
             '_id', u.id,
             'unitNumber', ${unitNumExpr},
             'unit_number', ${unitNumExpr},
             'unitName', ${unitNameExpr},
             'unit_name', ${unitNameExpr},
             'representativeName', ${repNameExpr},
             'representative_name', ${repNameExpr},
             'representativePhone', ${repPhoneExpr},
             'representative_phone', ${repPhoneExpr}
           )) FROM units u WHERE u.ward_id = w.id),
           '[]'::json
         ) as units
       FROM wards w WHERE w.id = $1`,
      [wardId]
    );

    const row = updated.rows[0];
    if (!row) return res.status(404).json({ error: 'Ward not found' });

    const mappedUnits = (row.units || []).map((u: any) => ({
      ...u,
      id: u?.id ? String(u.id) : undefined,
      _id: u?.id ? String(u.id) : undefined,
      unitNumber: u?.unitNumber ?? u?.unit_number ?? '',
      unit_number: u?.unitNumber ?? u?.unit_number ?? '',
      unitName: u?.unitName ?? u?.unit_name ?? '',
      unit_name: u?.unitName ?? u?.unit_name ?? '',
      representativeName: u?.representativeName ?? u?.representative_name ?? '',
      representative_name: u?.representativeName ?? u?.representative_name ?? '',
      representativePhone: u?.representativePhone ?? u?.representative_phone ?? '',
      representative_phone: u?.representativePhone ?? u?.representative_phone ?? '',
    }));

    return res.status(201).json({
      ...row,
      id: String(row.id),
      _id: String(row.id),
      wardNumber: row.ward_number || row.id,
      ward_number: row.ward_number || row.id,
      wardName: row.ward_name,
      ward_name: row.ward_name,
      patron: row.ward_name,
      total_units: row.total_units || mappedUnits.length,
      totalUnits: row.total_units || mappedUnits.length,
      units: mappedUnits,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/*** Family & Member JSON Mapping Helpers ***/
export const mapFamilyRow = (row: any) => {
  const wObj = typeof row.ward === 'object' ? row.ward : (typeof row.ward_id === 'object' ? row.ward_id : null);
  const wId = wObj ? String(wObj.id || wObj._id || '') : (row.ward_id ? String(row.ward_id) : null);
  const wName = wObj?.ward_name || wObj?.wardName || row.ward_name || '';
  const wNum = wObj?.ward_number ?? wObj?.wardNumber ?? row.ward_number ?? null;

  return {
    ...row,
    id: String(row.id),
    _id: String(row.id),
    family_id: String(row.id),
    familyName: row.family_name || '',
    family_name: row.family_name || '',
    houseName: row.house_name || '',
    house_name: row.house_name || '',
    headOfFamily: row.head_of_family || '',
    head_of_family: row.head_of_family || '',
    head: row.head_of_family || '',
    unitNumber: row.unit_number || '',
    unit_number: row.unit_number || '',
    unit: row.unit_number || '',
    homeAddress: row.home_address || '',
    home_address: row.home_address || '',
    address: row.home_address || '',
    familyPhotoUrl: row.family_photo_url || '',
    family_photo_url: row.family_photo_url || '',
    contactNumber: row.contact_number || '',
    contact_number: row.contact_number || '',
    phone: row.contact_number || '',
    email: row.email || '',
    wardId: wId,
    ward_id: wId,
    ward: row.ward || wObj,
    wardName: wName,
    ward_name: wName,
    wardNumber: wNum,
    ward_number: wNum,
    memberCount: Number(row.member_count) || 0,
    member_count: Number(row.member_count) || 0,
    familyCode: row.family_code || '',
    family_code: row.family_code || '',
    regNo: row.reg_no || '',
    reg_no: row.reg_no || '',
  };
};

export const mapMemberRow = (row: any) => {
  const fId = row.family_id && typeof row.family_id === 'object'
    ? String(row.family_id.id || row.family_id._id || '')
    : (row.family_id ? String(row.family_id) : '');
  const wId = row.ward_id && typeof row.ward_id === 'object'
    ? String(row.ward_id.id || row.ward_id._id || '')
    : (row.ward_id ? String(row.ward_id) : '');
  const fObj = typeof row.family_id === 'object' ? row.family_id : (typeof row.family === 'object' ? row.family : null);
  const wObj = typeof row.ward_id === 'object' ? row.ward_id : (typeof row.ward === 'object' ? row.ward : null);
  const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Parishioner';
  const houseName = row.house_name || fObj?.house_name || '';
  const familyName = row.family_name || fObj?.family_name || houseName;

  return {
    ...row,
    id: String(row.id),
    _id: String(row.id),
    member_id: String(row.id),
    firstName: row.first_name || '',
    first_name: row.first_name || '',
    lastName: row.last_name || '',
    last_name: row.last_name || '',
    fullName,
    name: fullName,
    malayalamName: row.malayalam_name || '',
    malayalam_name: row.malayalam_name || '',
    nameMl: row.malayalam_name || '',
    baptismName: row.baptism_name || '',
    baptism_name: row.baptism_name || '',
    phoneNumber: row.phone_number || '',
    phone_number: row.phone_number || '',
    phone: row.phone_number || '',
    email: row.email || '',
    bloodGroup: row.blood_group || '',
    blood_group: row.blood_group || '',
    relationshipRole: row.relationship_role || 'Member',
    relationship_role: row.relationship_role || 'Member',
    relationshipToHead: row.relationship_role || 'Member',
    isHeadOfHousehold: Boolean(row.is_head_of_household),
    is_head_of_household: Boolean(row.is_head_of_household),
    dob: row.dob,
    dom: row.dom,
    occupation: row.occupation || '',
    gender: row.gender || 'MALE',
    status: row.status || 'active',
    familyId: fId,
    family_id: fId,
    family: fObj,
    houseName,
    house_name: houseName,
    familyName,
    family_name: familyName,
    familyHouse: houseName,
    wardId: wId,
    ward_id: wId,
    wardName: wObj?.ward_name || '',
    ward_name: wObj?.ward_name || '',
    wardNumber: wObj?.ward_number ?? null,
    ward_number: wObj?.ward_number ?? null,
  };
};

/*** Family Management ***/
export const getAllFamilies = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT f.*,
         json_build_object(
           'id', w.id,
           '_id', w.id,
           'ward_name', w.ward_name,
           'wardName', w.ward_name,
           'ward_number', w.ward_number,
           'wardNumber', w.ward_number
         ) as ward,
         (SELECT count(*)::int FROM members m WHERE m.family_id = f.id) as member_count
       FROM families f
       LEFT JOIN wards w ON f.ward_id = w.id
       ORDER BY f.family_name ASC`
    );

    const mapped = result.rows.map((row: any) => mapFamilyRow(row));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching families' });
  }
};

export const getFamilyById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid family id required' });

    const famResult = await pool.query(
      `SELECT f.*,
         json_build_object(
           'id', w.id,
           '_id', w.id,
           'ward_name', w.ward_name,
           'wardNumber', w.ward_number
         ) as ward
       FROM families f
       LEFT JOIN wards w ON f.ward_id = w.id
       WHERE f.id = $1`,
      [id]
    );

    if (famResult.rows.length === 0) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const memResult = await pool.query(
      `SELECT m.*, m.id as _id
       FROM members m
       WHERE m.family_id = $1
       ORDER BY m.is_head_of_household DESC, m.first_name ASC`,
      [id]
    );

    const famRow = famResult.rows[0];
    const family = mapFamilyRow(famRow);
    const members = memResult.rows.map((m: any) => mapMemberRow(m));

    res.json({ family, members });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching family details' });
  }
};

export const createFamily = async (req: Request, res: Response) => {
  try {
    const { houseName, house_name, familyName, family_name, familyCode, family_code, headOfFamily, head_of_family, wardId, ward, unit, unitNumber, unit_number, address, homeAddress, home_address, contactNumber, contact_number, regNo, reg_no, email, unitId, unit_id } = req.body;

    let familyPhotoUrl = extractUploadedPhoto(req);
    if (!familyPhotoUrl) {
      familyPhotoUrl = req.body.familyPhotoUrl || req.body.family_photo_url || req.body.family_photo || null;
    }

    const cleanWard = parseId(wardId || ward);
    const hName = houseName || house_name || familyName || family_name || 'Parish House';
    const fName = familyName || family_name || hName;
    const assignedUnit = unit || unit_number || unitNumber || 'Unit I';
    const homeAddr = homeAddress || home_address || address || '';
    const phone = contactNumber || contact_number || null;
    const head = headOfFamily || head_of_family || null;
    const reg = regNo || reg_no || null;
    const fCode = familyCode || family_code || null;
    const uId = parseId(unitId || unit_id);

    const result = await pool.query(
      `INSERT INTO families (
         family_name, head_of_family, ward_id, unit_number, house_name,
         home_address, family_photo_url, contact_number, unit_id, reg_no, email, family_code
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [fName, head, cleanWard, assignedUnit, hName, homeAddr, familyPhotoUrl, phone, uId, reg, email || null, fCode]
    );

    const row = result.rows[0];
    res.status(201).json(mapFamilyRow(row));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating family' });
  }
};

export const updateFamily = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid family id required' });

    const { houseName, house_name, familyName, family_name, familyCode, family_code, headOfFamily, head_of_family, wardId, ward, unit, unitNumber, unit_number, address, homeAddress, home_address, contactNumber, contact_number, regNo, reg_no, email, unitId, unit_id } = req.body;

    let familyPhotoUrl = extractUploadedPhoto(req);
    if (!familyPhotoUrl) {
      familyPhotoUrl = req.body.familyPhotoUrl || req.body.family_photo_url || req.body.family_photo || null;
    }

    const cleanWard = parseId(wardId || ward);
    const hName = houseName || house_name || familyName || family_name;
    const fName = familyName || family_name || hName;
    const assignedUnit = unit || unit_number || unitNumber;
    const homeAddr = homeAddress || home_address || address;
    const phone = contactNumber || contact_number;
    const head = headOfFamily || head_of_family;
    const reg = regNo || reg_no;
    const fCode = familyCode || family_code;
    const uId = parseId(unitId || unit_id);

    const result = await pool.query(
      `UPDATE families SET
         family_name = COALESCE($1, family_name),
         head_of_family = COALESCE($2, head_of_family),
         ward_id = COALESCE($3, ward_id),
         unit_number = COALESCE($4, unit_number),
         house_name = COALESCE($5, house_name),
         home_address = COALESCE($6, home_address),
         family_photo_url = COALESCE($7, family_photo_url),
         contact_number = COALESCE($8, contact_number),
         unit_id = COALESCE($9, unit_id),
         reg_no = COALESCE($10, reg_no),
         email = COALESCE($11, email),
         family_code = COALESCE($12, family_code)
       WHERE id = $13
       RETURNING *`,
      [fName, head, cleanWard, assignedUnit, hName, homeAddr, familyPhotoUrl, phone, uId, reg, email, fCode, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Family not found' });
    const row = result.rows[0];
    res.json(mapFamilyRow(row));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating family' });
  }
};

export const deleteFamily = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid family id required' });
    await pool.query('DELETE FROM families WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting family' });
  }
};

/*** Member / Parishioner Management ***/
export const getAllMembers = async (req: Request, res: Response) => {
  try {
    const { search, familyId, family_id } = req.query;
    const targetFamilyId = parseId(familyId || family_id);

    let sql = `
      SELECT m.*, m.id as _id,
             f.house_name, f.family_name,
             json_build_object('id', f.id, '_id', f.id, 'house_name', f.house_name, 'family_name', f.family_name) as family_id,
             json_build_object('id', w.id, '_id', w.id, 'ward_name', w.ward_name, 'ward_number', w.ward_number) as ward_id
      FROM members m
      LEFT JOIN families f ON m.family_id = f.id
      LEFT JOIN wards w ON f.ward_id = w.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (targetFamilyId) {
      params.push(targetFamilyId);
      sql += ` AND m.family_id = $${params.length}`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      sql += ` AND (
        LOWER(m.first_name) LIKE $${pIdx} OR
        LOWER(m.last_name) LIKE $${pIdx} OR
        LOWER(COALESCE(m.baptism_name, '')) LIKE $${pIdx} OR
        LOWER(COALESCE(m.phone_number, '')) LIKE $${pIdx} OR
        LOWER(COALESCE(f.house_name, '')) LIKE $${pIdx}
      )`;
    }

    sql += ` ORDER BY m.last_name ASC, m.first_name ASC`;
    const result = await pool.query(sql, params);

    const mapped = result.rows.map((row: any) => mapMemberRow(row));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching members' });
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const {
      familyId, family_id, family,
      fullName, name, firstName, first_name, lastName, last_name,
      malayalamName, malayalam_name, nameMl,
      baptismName, baptism_name,
      gender,
      phoneNumber, phone_number, phone,
      email,
      relationshipToHead, relationshipRole, relationship_role, relation_to_head,
      isHeadOfHousehold, is_head_of_household,
      dob, dom,
      occupation, bloodGroup, blood_group,
      sacraments, status
    } = req.body;

    const famId = parseId(familyId || family_id || family);
    if (!famId) return res.status(400).json({ error: 'Valid familyId required' });

    const nameStr = fullName || name || '';
    let fName = firstName || first_name || '';
    let lName = lastName || last_name || '';
    if (!fName && nameStr) {
      const parts = nameStr.trim().split(' ');
      fName = parts[0] || '';
      lName = parts.slice(1).join(' ') || '';
    }

    const rel = relationshipToHead || relationshipRole || relationship_role || relation_to_head || 'Member';
    const head = isHeadOfHousehold !== undefined ? Boolean(isHeadOfHousehold) : Boolean(is_head_of_household);

    const isDirVisible = req.body.isDirectoryVisible !== undefined 
      ? Boolean(req.body.isDirectoryVisible) 
      : (req.body.is_directory_visible !== undefined ? Boolean(req.body.is_directory_visible) : true);
    const mRole = req.body.role || 'parishioner';

    const result = await pool.query(
      `INSERT INTO members (
         family_id, first_name, last_name, phone_number, email,
         relationship_role, is_head_of_household, dob, dom, occupation, blood_group,
         malayalam_name, baptism_name, gender, status, sacraments, is_directory_visible, role
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        famId, fName || 'Member', lName || '',
        phone || phoneNumber || phone_number || null,
        email || null,
        rel, head,
        parseDate(dob), parseDate(dom),
        occupation || null, bloodGroup || blood_group || null,
        malayalamName || malayalam_name || nameMl || null,
        baptismName || baptism_name || null,
        gender || 'MALE', status || 'active',
        Array.isArray(sacraments) ? sacraments : [],
        isDirVisible,
        mRole
      ]
    );

    const row = result.rows[0];
    res.status(201).json(mapMemberRow(row));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating member' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid member id required' });

    const {
      familyId, family_id, family,
      firstName, first_name, lastName, last_name,
      phoneNumber, phone_number, phone,
      email,
      relationshipToHead, relationshipRole, relationship_role, relation_to_head,
      isHeadOfHousehold, is_head_of_household,
      dob, dom,
      occupation, bloodGroup, blood_group,
      malayalamName, malayalam_name, nameMl,
      baptismName, baptism_name,
      gender, status
    } = req.body;

    const famId = parseId(familyId || family_id || family);
    const fName = firstName || first_name;
    const lName = lastName || last_name;
    const ph = phone || phoneNumber || phone_number;
    const rel = relationshipToHead || relationshipRole || relationship_role || relation_to_head;
    const head = isHeadOfHousehold !== undefined ? Boolean(isHeadOfHousehold) : (is_head_of_household !== undefined ? Boolean(is_head_of_household) : undefined);

    const result = await pool.query(
      `UPDATE members SET
         family_id = COALESCE($1, family_id),
         first_name = COALESCE($2, first_name),
         last_name = COALESCE($3, last_name),
         phone_number = COALESCE($4, phone_number),
         email = COALESCE($5, email),
         relationship_role = COALESCE($6, relationship_role),
         is_head_of_household = COALESCE($7, is_head_of_household),
         dob = COALESCE($8, dob),
         dom = COALESCE($9, dom),
         occupation = COALESCE($10, occupation),
         blood_group = COALESCE($11, blood_group),
         malayalam_name = COALESCE($12, malayalam_name),
         baptism_name = COALESCE($13, baptism_name),
         gender = COALESCE($14, gender),
         status = COALESCE($15, status)
       WHERE id = $16
       RETURNING *`,
      [
        famId, fName, lName, ph, email, rel, head,
        parseDate(dob), parseDate(dom), occupation, bloodGroup || blood_group,
        malayalamName || malayalam_name || nameMl, baptismName || baptism_name,
        gender, status, id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    const row = result.rows[0];
    res.json(mapMemberRow(row));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating member' });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid member id required' });
    await pool.query('DELETE FROM members WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting member' });
  }
};

export const importMembersBulk = async (req: Request, res: Response): Promise<any> => {
  try {
    const { members } = req.body;
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "No records supplied" });
    }

    let insertedCount = 0;
    for (const m of members) {
      const rawName = m.fullName || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Parishioner';
      const nameParts = rawName.split(' ');
      const firstName = nameParts[0] || 'Parishioner';
      const lastName = nameParts.slice(1).join(' ') || '';
      const phone = m.phone || m.phone_number || m.phoneNumber || '';
      const blood = m.bloodGroup || m.blood_group || m.blood || 'O+';
      const houseName = m.houseName || m.familyHouse || m.house_name || m.familyName || 'Parish House';

      let famId: number;
      const famRes = await pool.query(
        'SELECT id FROM families WHERE house_name = $1 OR family_name = $1 LIMIT 1',
        [houseName]
      );
      if (famRes.rows.length > 0) {
        famId = famRes.rows[0].id;
      } else {
        const newFam = await pool.query(
          'INSERT INTO families (family_name, house_name, contact_number, unit_number) VALUES ($1, $2, $3, $4) RETURNING id',
          [houseName, houseName, phone, 'Unit I']
        );
        famId = newFam.rows[0].id;
      }

      await pool.query(
        `INSERT INTO members (family_id, first_name, last_name, phone_number, blood_group, relationship_role)
         VALUES ($1, $2, $3, $4, $5, 'Member')`,
        [famId, firstName, lastName, phone, blood]
      );
      insertedCount++;
    }

    res.json({ message: "Successfully imported parishioners", count: insertedCount });
  } catch (err: any) {
    console.error('Error importing members bulk:', err);
    res.status(500).json({ error: err.message || 'Bulk import failed' });
  }
};

/*** Dashboard Overview ***/
export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
         (SELECT count(*)::int FROM wards) as wards,
         (SELECT count(*)::int FROM families) as families,
         (SELECT count(*)::int FROM members) as members,
         (SELECT count(*)::int FROM app_users) as users`
    );
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching dashboard stats' });
  }
};