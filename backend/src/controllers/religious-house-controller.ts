import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

const SAMPLE_RESIDENTS: Record<string, any[]> = {
  Convent: [
    { name: 'Sr. Little Rose CMC', designation: 'Mother Superior', phone: '+91 94470 71001', email: 'superior.carmel@devagiri.org' },
    { name: 'Sr. Mary Joseph CMC', designation: 'Vice Superior', phone: '+91 94470 71005', email: 'mary.j@devagiri.org' },
    { name: 'Sr. Anitha Thomas CMC', designation: 'School Principal', phone: '+91 94470 71008', email: 'anitha.t@devagiri.org' },
    { name: 'Sr. Teresa Mundackal CMC', designation: 'Counselor', phone: '+91 94470 44051', email: 'teresa.m@devagiri.org' },
    { name: 'Sr. Grace Maria CMC', designation: 'Health Administrator', phone: '+91 94470 71012', email: 'grace.m@devagiri.org' },
  ],
  Monastery: [
    { name: 'Fr. Bonaventure OFM', designation: 'Guardian / Superior', phone: '+91 94470 71002', email: 'bonaventure@devagiri.org' },
    { name: 'Fr. George Varghese OFM', designation: 'Vicar / Assistant', phone: '+91 94470 71006', email: 'george.v@devagiri.org' },
    { name: 'Fr. Mathew Kalapurackal OFM', designation: 'Formator', phone: '+91 94470 71009', email: 'mathew.k@devagiri.org' },
    { name: 'Br. Antony Puthur OFM', designation: 'Sacristan', phone: '+91 94470 71014', email: 'antony.p@devagiri.org' },
  ],
  'Formation House': [
    { name: 'Sr. Christy SABS', designation: 'Directress of Formees', phone: '+91 94470 71003', email: 'christy.sabs@devagiri.org' },
    { name: 'Sr. Rosamma Edathil SABS', designation: 'Assistant Directress', phone: '+91 94470 66309', email: 'rosamma.e@devagiri.org' },
    { name: 'Sr. Anna Kizhakkel SABS', designation: 'Spiritual Guide', phone: '+91 94470 88402', email: 'anna.k@devagiri.org' },
    { name: 'Sr. Philomena SABS', designation: 'Administrator', phone: '+91 94470 71017', email: 'philomena@devagiri.org' },
    { name: 'Sr. Alphonsa SABS', designation: 'Novice Sister', phone: '+91 94470 71018', email: 'alphonsa@devagiri.org' },
    { name: 'Sr. Rita Maria SABS', designation: 'Novice Sister', phone: '+91 94470 71019', email: 'rita@devagiri.org' },
  ],
};

/**
 * GET /api/directory/religious-houses or /api/admin/religious-houses
 */
export const getAllReligiousHouses = async (_req: Request, res: Response): Promise<any> => {
  try {
    const result = await pool.query(
      `SELECT *, id as _id FROM religious_houses ORDER BY name ASC`
    );
    const mapped = result.rows.map((row: any) => {
      const typeKey = row.category || row.category_type || 'Convent';
      const defaultList = SAMPLE_RESIDENTS[typeKey] || SAMPLE_RESIDENTS['Convent'];
      const residents = (Array.isArray(row.residents) && row.residents.length > 0) ? row.residents : defaultList;
      return {
        ...row,
        id: String(row.id),
        _id: String(row.id),
        residents,
      };
    });
    res.status(200).json(mapped);
  } catch (error: any) {
    console.error('Error fetching religious houses:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * POST /api/admin/religious-houses
 */
export const createReligiousHouse = async (req: Request, res: Response): Promise<any> => {
  const { name, category, category_type, superiorInCharge, superior_in_charge, residentCount, resident_count, contactNumber, contact_number, email, address, photoUrl, photo_url } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const cat = category || category_type || 'Convent';
  const sup = superiorInCharge || superior_in_charge || '';
  const count = Number(residentCount || resident_count || 0);
  const phone = contactNumber || contact_number || '';
  const photo = photoUrl || photo_url || '';

  try {
    const defaultList = SAMPLE_RESIDENTS[cat] || SAMPLE_RESIDENTS['Convent'];
    const result = await pool.query(
      `INSERT INTO religious_houses (
         name, category, category_type, superior_in_charge, resident_count,
         contact_number, email, address, photo_url, residents
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *, id as _id`,
      [name.trim(), cat.trim(), cat.trim(), sup.trim(), count, phone.trim(), email ? email.trim() : '', address ? address.trim() : '', photo, JSON.stringify(defaultList)]
    );
    const row = result.rows[0];
    res.status(201).json({ ...row, id: String(row.id), _id: String(row.id) });
  } catch (error: any) {
    console.error('Error creating religious house:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * PUT /api/admin/religious-houses/:id
 */
export const updateReligiousHouse = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  const { name, category, category_type, superiorInCharge, superior_in_charge, residentCount, resident_count, contactNumber, contact_number, email, address, photoUrl, photo_url } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const cat = category || category_type || 'Convent';
  const sup = superiorInCharge || superior_in_charge || '';
  const count = Number(residentCount || resident_count || 0);
  const phone = contactNumber || contact_number || '';
  const photo = photoUrl || photo_url || '';

  try {
    const result = await pool.query(
      `UPDATE religious_houses SET
         name = $1, category = $2, category_type = $3, superior_in_charge = $4,
         resident_count = $5, contact_number = $6, email = $7, address = $8, photo_url = $9
       WHERE id = $10
       RETURNING *, id as _id`,
      [name.trim(), cat.trim(), cat.trim(), sup.trim(), count, phone.trim(), email ? email.trim() : '', address ? address.trim() : '', photo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Religious house not found.' });
    }
    const row = result.rows[0];
    res.status(200).json({ ...row, id: String(row.id), _id: String(row.id) });
  } catch (error: any) {
    console.error('Error updating religious house:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/admin/religious-houses/:id
 */
export const deleteReligiousHouse = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  try {
    const result = await pool.query('DELETE FROM religious_houses WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Religious house not found.' });
    }
    res.status(200).json({ message: 'Religious house deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting religious house:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * POST /api/admin/religious-houses/:id/residents
 */
export const addResidentToHouse = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  const { name, designation, phone, email, photo } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required for resident.' });
  }

  try {
    const houseRes = await pool.query('SELECT * FROM religious_houses WHERE id = $1', [id]);
    if (houseRes.rows.length === 0) return res.status(404).json({ error: 'Religious house not found.' });
    const house = houseRes.rows[0];

    const typeKey = house.category || house.category_type || 'Convent';
    const residents: any[] = Array.isArray(house.residents) && house.residents.length > 0
      ? house.residents
      : (SAMPLE_RESIDENTS[typeKey] || []);

    const newResident = {
      id: Date.now(),
      name: name.trim(),
      designation: designation ? designation.trim() : '',
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      photo: photo || '',
    };
    residents.push(newResident);

    const updateRes = await pool.query(
      `UPDATE religious_houses SET residents = $1, resident_count = $2 WHERE id = $3 RETURNING *, id as _id`,
      [JSON.stringify(residents), residents.length, id]
    );

    res.status(201).json(updateRes.rows[0]);
  } catch (error: any) {
    console.error('Error adding resident:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/admin/religious-houses/:id/residents/:residentId
 */
export const removeResidentFromHouse = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  const { residentId } = req.params;
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  try {
    const houseRes = await pool.query('SELECT * FROM religious_houses WHERE id = $1', [id]);
    if (houseRes.rows.length === 0) return res.status(404).json({ error: 'Religious house not found.' });
    const house = houseRes.rows[0];

    const typeKey = house.category || house.category_type || 'Convent';
    const residents: any[] = Array.isArray(house.residents) && house.residents.length > 0
      ? house.residents
      : (SAMPLE_RESIDENTS[typeKey] || []);

    const filtered = residents.filter((r: any) =>
      String(r.id || r._id || r.name) !== String(residentId) && r.name !== residentId
    );

    const updateRes = await pool.query(
      `UPDATE religious_houses SET residents = $1, resident_count = $2 WHERE id = $3 RETURNING *, id as _id`,
      [JSON.stringify(filtered), filtered.length, id]
    );

    res.status(200).json(updateRes.rows[0]);
  } catch (error: any) {
    console.error('Error removing resident:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
