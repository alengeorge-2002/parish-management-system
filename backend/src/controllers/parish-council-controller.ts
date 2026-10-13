import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

/**
 * GET /api/admin/parish-council
 * Retrieves all parish council seats for admin panel.
 */
export const getAllSeatsAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT pc.*, pc.id as _id,
              m.first_name, m.last_name, m.phone_number, m.email,
              w.ward_name, w.ward_number
       FROM parish_council pc
       LEFT JOIN members m ON pc.member_id = m.id
       LEFT JOIN wards w ON pc.ward_id = w.id
       ORDER BY pc.committee_type ASC, pc.display_order ASC, pc.id ASC`
    );

    const mapped = result.rows.map((row: any) => ({
      ...row,
      id: String(row.id),
      _id: String(row.id),
      member_id: row.member_id ? String(row.member_id) : null,
      ward_id: row.ward_id ? String(row.ward_id) : null,
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      ward_name: row.ward_name || '',
      occupantName: row.occupant_name || (row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : null),
      phone: row.phone || row.phone_number || null,
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    console.error('Error fetching admin seats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch seats.' });
  }
};

/**
 * POST /api/admin/parish-council or /api/parish-council/seats
 * Creates a new parish council seat.
 */
export const createSeat = async (req: Request, res: Response): Promise<void> => {
  const {
    roleTitle, englishTitle, role_title,
    category, committee_type,
    wardNumber, ward_id,
    term, member_id, memberId,
    occupantName, phone, display_order
  } = req.body;

  const finalTitle = roleTitle || englishTitle || role_title;
  if (!finalTitle) {
    res.status(400).json({ error: 'roleTitle is required.' });
    return;
  }

  const finalCategory = category || committee_type || 'Ward Councillor';
  const targetMemberId = parseId(member_id || memberId);
  const targetWardId = parseId(ward_id || wardNumber);

  try {
    const countRes = await pool.query('SELECT count(*)::int as count FROM parish_council');
    const count = countRes.rows[0].count || 0;
    const finalOrder = display_order ? parseInt(String(display_order), 10) : count + 1;
    const finalStatus = (targetMemberId || occupantName) ? 'filled' : 'vacant';

    await pool.query(
      `INSERT INTO parish_council (
         role_title, committee_type, ward_id, member_id,
         occupant_name, phone, term, status, display_order
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        finalTitle.trim(), finalCategory.trim(), targetWardId, targetMemberId,
        occupantName || null, phone || null, term || '2024 – 2026', finalStatus, finalOrder
      ]
    );

    const result = await pool.query(
      `SELECT pc.*, pc.id as _id,
              m.first_name, m.last_name, m.phone_number, m.email,
              w.ward_name, w.ward_number
       FROM parish_council pc
       LEFT JOIN members m ON pc.member_id = m.id
       LEFT JOIN wards w ON pc.ward_id = w.id
       ORDER BY pc.display_order ASC`
    );

    res.status(201).json(result.rows);
  } catch (error: any) {
    console.error('Error creating seat:', error);
    res.status(500).json({ error: error.message || 'Failed to create seat.' });
  }
};

/**
 * PUT /api/parish-council/seats/:id/assign
 */
export const assignSeat = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  const { memberId, member_id, term, occupantName, phone } = req.body;
  const targetMemberId = parseId(memberId || member_id);

  if (!id) {
    res.status(400).json({ error: 'Valid id required' });
    return;
  }

  try {
    let pName = occupantName || null;
    let pPhone = phone || null;

    if (targetMemberId && (!pName || !pPhone)) {
      const memRes = await pool.query('SELECT first_name, last_name, phone_number FROM members WHERE id = $1', [targetMemberId]);
      if (memRes.rows.length > 0) {
        const m = memRes.rows[0];
        pName = pName || `${m.first_name || ''} ${m.last_name || ''}`.trim();
        pPhone = pPhone || m.phone_number;
      }
    }

    const result = await pool.query(
      `UPDATE parish_council SET
         member_id = COALESCE($1, member_id),
         occupant_name = COALESCE($2, occupant_name),
         phone = COALESCE($3, phone),
         term = COALESCE($4, term),
         status = 'filled'
       WHERE id = $5
       RETURNING *, id as _id`,
      [targetMemberId, pName, pPhone, term, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error assigning seat:', error);
    res.status(500).json({ error: error.message || 'Failed to assign seat.' });
  }
};

/**
 * PUT /api/parish-council/seats/:id/vacate
 */
export const vacateSeat = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'Valid id required' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE parish_council SET
         member_id = NULL,
         occupant_name = NULL,
         phone = NULL,
         status = 'vacant'
       WHERE id = $1
       RETURNING *, id as _id`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error vacating seat:', error);
    res.status(500).json({ error: error.message || 'Failed to vacate seat.' });
  }
};

/**
 * PUT /api/admin/parish-council/:id or /api/parish-council/seats/:id
 */
export const updateSeat = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'Valid id required' });
    return;
  }

  const { member_id, memberId, role_title, roleTitle, committee_type, category, ward_id, term, occupantName, phone, status } = req.body;
  const targetMemberId = parseId(member_id || memberId);
  const title = role_title || roleTitle;
  const cat = committee_type || category;
  const targetWardId = parseId(ward_id);

  try {
    const result = await pool.query(
      `UPDATE parish_council SET
         member_id = COALESCE($1, member_id),
         role_title = COALESCE($2, role_title),
         committee_type = COALESCE($3, committee_type),
         ward_id = COALESCE($4, ward_id),
         term = COALESCE($5, term),
         occupant_name = COALESCE($6, occupant_name),
         phone = COALESCE($7, phone),
         status = COALESCE($8, status)
       WHERE id = $9
       RETURNING *, id as _id`,
      [targetMemberId, title, cat, targetWardId, term, occupantName, phone, status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating seat:', error);
    res.status(500).json({ error: error.message || 'Failed to update seat.' });
  }
};

/**
 * DELETE /api/admin/parish-council/:id
 */
export const deleteSeat = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'Valid id required' });
    return;
  }

  try {
    const result = await pool.query('DELETE FROM parish_council WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }
    res.status(200).json({ message: 'Seat deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting seat:', error);
    res.status(500).json({ error: error.message || 'Failed to delete seat.' });
  }
};

/**
 * GET /api/directory/quick-contacts
 */
export const getQuickContacts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT pc.role_title,
              COALESCE(pc.occupant_name, CONCAT(m.first_name, ' ', m.last_name)) as name,
              COALESCE(pc.phone, m.phone_number) as phone_number,
              m.email
       FROM parish_council pc
       LEFT JOIN members m ON pc.member_id = m.id
       WHERE pc.role_title IN ('Vicar', 'Assistant Vicar', 'Parish Secretary')
       ORDER BY pc.display_order ASC`
    );

    const contacts = result.rows;
    const roles = ['Vicar', 'Assistant Vicar', 'Parish Secretary'];
    const finalContacts = roles.map(role => {
      const found = contacts.find((c: any) => c.role_title === role);
      if (found && found.phone_number && found.phone_number.trim() !== '') return found;

      if (role === 'Vicar') {
        return {
          role_title: 'Vicar',
          name: 'Rev. Fr. Joseph Mathew',
          phone_number: '+919845000001',
          email: 'pp.stjosephdevagiri@gmail.com',
        };
      } else if (role === 'Assistant Vicar') {
        return {
          role_title: 'Assistant Vicar',
          name: 'Rev. Fr. George Varghese',
          phone_number: '+919845000002',
          email: 'assoc.stjosephdevagiri@gmail.com',
        };
      } else {
        return {
          role_title: 'Parish Secretary',
          name: 'Adv. Mary Antony',
          phone_number: '+914952701234',
          email: 'mary.antony@gmail.com',
        };
      }
    });

    res.status(200).json(finalContacts);
  } catch (error: any) {
    console.error('Error fetching quick contacts:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch quick contacts.' });
  }
};

/**
 * GET /api/directory/parish-council
 */
export const getParishCouncilDirectory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT pc.*, pc.id as _id,
              m.first_name, m.last_name, m.phone_number, m.email,
              w.ward_name
       FROM parish_council pc
       LEFT JOIN members m ON pc.member_id = m.id
       LEFT JOIN wards w ON pc.ward_id = w.id
       ORDER BY pc.committee_type ASC, pc.display_order ASC`
    );

    const mapped = result.rows.map((row: any) => ({
      ...row,
      id: String(row.id),
      _id: String(row.id),
      role_title: row.role_title,
      committee_type: row.committee_type,
      ward_id: row.ward_id ? String(row.ward_id) : null,
      display_order: row.display_order || 0,
      member_id: row.member_id ? String(row.member_id) : null,
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      phone_number: row.phone_number || row.phone || null,
      email: row.email || null,
      ward_name: row.ward_name || '',
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    console.error('Error fetching parish council directory:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch directory.' });
  }
};
