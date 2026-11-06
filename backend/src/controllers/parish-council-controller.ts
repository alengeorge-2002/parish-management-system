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

const DEFAULT_CONTACTS = {
  vicar: { title: 'Vicar', name: 'Rev. Fr. Joseph Mathew', phone: '+91 94471 00001' },
  assistantVicar: { title: 'Assistant Vicar', name: 'Rev. Fr. George Varghese', phone: '+91 94471 00002' },
  secretary: { title: 'Parish Secretary', name: 'Adv. Mary Antony', phone: '+91 94471 00003' }
};

/**
 * GET /api/directory/quick-contacts
 * Returns live parish leadership quick contacts (Vicar, Assistant Vicar, Parish Secretary)
 * querying clergy and parish council with default fallbacks.
 */
export const getQuickContacts = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Vicar: Look up in clergy where role/designation ILIKE '%vicar%' (exclude 'asst' or 'assistant')
    const vicarQuery = `
      SELECT name, COALESCE(phone_number, '') AS phone
      FROM clergy
      WHERE (designation ILIKE '%vicar%' OR role_type ILIKE '%vicar%')
        AND designation NOT ILIKE '%asst%'
        AND designation NOT ILIKE '%assistant%'
        AND role_type NOT ILIKE '%asst%'
        AND role_type NOT ILIKE '%assistant%'
      ORDER BY display_order ASC, id ASC
      LIMIT 1
    `;

    // 2. Assistant Vicar: Look up in clergy where role/designation ILIKE '%asst%' OR role/designation ILIKE '%assistant%'
    const asstVicarQuery = `
      SELECT name, COALESCE(phone_number, '') AS phone
      FROM clergy
      WHERE (
        designation ILIKE '%asst%' OR designation ILIKE '%assistant%' OR designation ILIKE '%associate%' OR
        role_type ILIKE '%asst%' OR role_type ILIKE '%assistant%' OR role_type ILIKE '%associate%'
      )
      ORDER BY display_order ASC, id ASC
      LIMIT 1
    `;

    // 3. Parish Secretary: Look up in parish_council or clergy where role/designation ILIKE '%secretary%'
    const councilSecretaryQuery = `
      SELECT COALESCE(pc.occupant_name, CONCAT(m.first_name, ' ', m.last_name)) AS name,
             COALESCE(pc.phone, m.phone_number, '') AS phone
      FROM parish_council pc
      LEFT JOIN members m ON pc.member_id = m.id
      WHERE pc.role_title ILIKE '%secretary%'
      ORDER BY pc.display_order ASC, pc.id ASC
      LIMIT 1
    `;

    const clergySecretaryQuery = `
      SELECT name, COALESCE(phone_number, '') AS phone
      FROM clergy
      WHERE designation ILIKE '%secretary%' OR role_type ILIKE '%secretary%'
      ORDER BY display_order ASC, id ASC
      LIMIT 1
    `;

    const [vicarRes, asstVicarRes, councilSecRes, clergySecRes] = await Promise.all([
      pool.query(vicarQuery).catch(() => pool.query(`
        SELECT name, COALESCE(phone_number, '') AS phone
        FROM clergy_directory
        WHERE (designation ILIKE '%vicar%' OR role_type ILIKE '%vicar%')
          AND designation NOT ILIKE '%asst%' AND designation NOT ILIKE '%assistant%'
          AND role_type NOT ILIKE '%asst%' AND role_type NOT ILIKE '%assistant%'
        ORDER BY display_order ASC, id ASC LIMIT 1
      `)).catch(() => ({ rows: [] })),
      pool.query(asstVicarQuery).catch(() => pool.query(`
        SELECT name, COALESCE(phone_number, '') AS phone
        FROM clergy_directory
        WHERE (
          designation ILIKE '%asst%' OR designation ILIKE '%assistant%' OR designation ILIKE '%associate%' OR
          role_type ILIKE '%asst%' OR role_type ILIKE '%assistant%' OR role_type ILIKE '%associate%'
        )
        ORDER BY display_order ASC, id ASC LIMIT 1
      `)).catch(() => ({ rows: [] })),
      pool.query(councilSecretaryQuery).catch(() => ({ rows: [] })),
      pool.query(clergySecretaryQuery).catch(() => pool.query(`
        SELECT name, COALESCE(phone_number, '') AS phone
        FROM clergy_directory
        WHERE designation ILIKE '%secretary%' OR role_type ILIKE '%secretary%'
        ORDER BY display_order ASC, id ASC LIMIT 1
      `)).catch(() => ({ rows: [] })),
    ]);

    // Build Vicar
    const vicarRow = vicarRes.rows.find((r: any) => r.phone && r.phone.trim() !== '') || vicarRes.rows[0];
    const vicarName = vicarRow?.name?.trim() || DEFAULT_CONTACTS.vicar.name;
    const vicarPhone = (vicarRow?.phone && vicarRow.phone.trim() !== '') ? vicarRow.phone.trim() : DEFAULT_CONTACTS.vicar.phone;

    // Build Assistant Vicar
    const asstRow = asstVicarRes.rows.find((r: any) => r.phone && r.phone.trim() !== '') || asstVicarRes.rows[0];
    const asstName = asstRow?.name?.trim() || DEFAULT_CONTACTS.assistantVicar.name;
    const asstPhone = (asstRow?.phone && asstRow.phone.trim() !== '') ? asstRow.phone.trim() : DEFAULT_CONTACTS.assistantVicar.phone;

    // Build Secretary
    const secRow = (councilSecRes.rows[0]?.phone?.trim() ? councilSecRes.rows[0] : (clergySecRes.rows[0]?.phone?.trim() ? clergySecRes.rows[0] : (councilSecRes.rows[0] || clergySecRes.rows[0])));
    const secName = secRow?.name?.trim() || DEFAULT_CONTACTS.secretary.name;
    const secPhone = (secRow?.phone && secRow.phone.trim() !== '') ? secRow.phone.trim() : DEFAULT_CONTACTS.secretary.phone;

    const finalContacts = [
      {
        role: 'Vicar',
        role_title: 'Vicar',
        name: vicarName,
        phone: vicarPhone,
        phone_number: vicarPhone,
      },
      {
        role: 'Assistant Vicar',
        role_title: 'Assistant Vicar',
        name: asstName,
        phone: asstPhone,
        phone_number: asstPhone,
      },
      {
        role: 'Parish Secretary',
        role_title: 'Parish Secretary',
        name: secName,
        phone: secPhone,
        phone_number: secPhone,
      },
    ];

    res.status(200).json(finalContacts);
  } catch (error: any) {
    console.error('Error fetching quick contacts:', error);
    res.status(200).json([
      {
        role: 'Vicar',
        role_title: 'Vicar',
        name: DEFAULT_CONTACTS.vicar.name,
        phone: DEFAULT_CONTACTS.vicar.phone,
        phone_number: DEFAULT_CONTACTS.vicar.phone,
      },
      {
        role: 'Assistant Vicar',
        role_title: 'Assistant Vicar',
        name: DEFAULT_CONTACTS.assistantVicar.name,
        phone: DEFAULT_CONTACTS.assistantVicar.phone,
        phone_number: DEFAULT_CONTACTS.assistantVicar.phone,
      },
      {
        role: 'Parish Secretary',
        role_title: 'Parish Secretary',
        name: DEFAULT_CONTACTS.secretary.name,
        phone: DEFAULT_CONTACTS.secretary.phone,
        phone_number: DEFAULT_CONTACTS.secretary.phone,
      },
    ]);
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
