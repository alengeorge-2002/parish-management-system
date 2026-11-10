import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

const DEFAULT_TERM = '2025 – 2027';

export const EXECUTIVE_SEATS = [
  { title: 'Vicar (President) / വികാരി', order: 1 },
  { title: 'Assistant Vicar (Vice President) / സഹവികാരി', order: 2 },
  { title: 'Trustee (Kaikkaran) I / കൈക്കാരൻ I', order: 3 },
  { title: 'Trustee (Kaikkaran) II / കൈക്കാരൻ II', order: 4 },
  { title: 'Parish Secretary / സെക്രട്ടറി', order: 5 },
  { title: 'Joint Secretary / ജോയിന്റ് സെക്രട്ടറി', order: 6 },
  { title: 'Auditor / അക്കൗണ്ട്സ് ഓഡിറ്റർ', order: 7 },
  { title: 'Sunday School Headmaster / സൺഡേ സ്കൂൾ ഡയറക്ടർ', order: 8 },
  { title: 'Convent Superior / സിസ്റ്റേഴ്സ് പ്രതിനിധി', order: 9 },
  { title: 'Youth Movement (KCYM) President / യുവജന പ്രതിനിധി', order: 10 },
  { title: 'Mathrusangham President / മാതൃവേദി പ്രതിനിധി', order: 11 },
  { title: 'St. Vincent de Paul President / വിൻസെന്റ് ഡി പോൾ പ്രതിനിധി', order: 12 },
];

let councilSeatsEnsured = false;

/**
 * Ensures standard designated Parish Council seats (12 Executive Committee + 1 per registered Ward)
 * are initialized in a strictly VACANT state without any fake/dummy sample names.
 */
export const ensureCouncilSeatsSeeded = async (forceCheck = false): Promise<void> => {
  if (councilSeatsEnsured && !forceCheck) return;
  try {
    const existingRes = await pool.query('SELECT id, role_title, committee_type, ward_id, member_id FROM parish_council');
    const existingRows = existingRes.rows || [];

    // Ensure no legacy dummy records without member_id stay 'filled'
    await pool.query(
      `UPDATE parish_council
       SET occupant_name = NULL, phone = NULL, status = 'vacant'
       WHERE member_id IS NULL AND (status IS DISTINCT FROM 'vacant' OR occupant_name IS NOT NULL OR phone IS NOT NULL)`
    );

    // 1. Seed designated Executive Committee seats if missing
    const existingExecTitles = new Set(
      existingRows
        .filter((r: any) => (r.committee_type || '').toLowerCase() === 'executive')
        .map((r: any) => (r.role_title || '').split('/')[0].trim().toLowerCase())
    );

    for (const seat of EXECUTIVE_SEATS) {
      const englishKey = seat.title.split('/')[0].trim().toLowerCase();
      if (!existingExecTitles.has(englishKey)) {
        await pool.query(
          `INSERT INTO parish_council (
             role_title, committee_type, ward_id, member_id,
             occupant_name, phone, term, status, display_order
           ) VALUES ($1, 'executive', NULL, NULL, NULL, NULL, $2, 'vacant', $3)`,
          [seat.title, DEFAULT_TERM, seat.order]
        );
      }
    }

    // 2. Dynamically create 1 vacant representative seat for each registered ward
    const wardsRes = await pool.query('SELECT id, ward_name, ward_number FROM wards ORDER BY COALESCE(ward_number, id) ASC');
    const existingWardIds = new Set(
      existingRows
        .filter((r: any) => r.ward_id !== null && r.ward_id !== undefined)
        .map((r: any) => Number(r.ward_id))
    );

    for (const w of wardsRes.rows) {
      if (!existingWardIds.has(Number(w.id))) {
        const wNum = w.ward_number || w.id;
        const wLabel = w.ward_name ? ` (${w.ward_name})` : '';
        const seatTitle = `Ward #${wNum} Representative${wLabel} / വാർഡ് കൗൺസിലർ`;
        const orderNum = 100 + (parseInt(String(wNum), 10) || Number(w.id));
        await pool.query(
          `INSERT INTO parish_council (
             role_title, committee_type, ward_id, member_id,
             occupant_name, phone, term, status, display_order
           ) VALUES ($1, 'ward_rep', $2, NULL, NULL, NULL, $3, 'vacant', $4)`,
          [seatTitle, w.id, DEFAULT_TERM, orderNum]
        );
      }
    }

    councilSeatsEnsured = true;
  } catch (err) {
    console.warn('ensureCouncilSeatsSeeded notice:', err);
  }
};

const SEAT_SELECT_QUERY = `
  SELECT pc.*, pc.id as _id,
         m.id as real_member_id, m.first_name, m.last_name, m.phone_number, m.email,
         f.house_name, f.family_name,
         w.ward_name, w.ward_number
  FROM parish_council pc
  LEFT JOIN members m ON pc.member_id = m.id
  LEFT JOIN families f ON m.family_id = f.id
  LEFT JOIN wards w ON pc.ward_id = w.id
`;

const mapSeatRow = (row: any) => {
  const isFilled = Boolean(row.real_member_id);
  const fullName = isFilled ? `${row.first_name || ''} ${row.last_name || ''}`.trim() : null;
  const houseName = isFilled ? (row.house_name || row.family_name || null) : null;
  const phone = isFilled ? (row.phone_number || row.phone || null) : null;
  const normalizedCategory =
    (row.committee_type || '').toLowerCase() === 'executive' ? 'executive' : 'ward_rep';

  return {
    ...row,
    id: String(row.id),
    _id: String(row.id),
    seat_title: row.role_title,
    role_title: row.role_title,
    roleTitle: row.role_title,
    category: normalizedCategory,
    committee_type: row.committee_type,
    term: row.term || DEFAULT_TERM,
    status: isFilled ? 'filled' : 'vacant',
    member_id: isFilled ? String(row.real_member_id) : null,
    occupant_name: fullName,
    occupantName: fullName,
    first_name: isFilled ? (row.first_name || '') : '',
    last_name: isFilled ? (row.last_name || '') : '',
    house_name: houseName,
    houseName: houseName,
    phone,
    phone_number: phone,
    email: isFilled ? (row.email || null) : null,
    ward_id: row.ward_id ? String(row.ward_id) : null,
    ward_name: row.ward_name || '',
    wardName: row.ward_name || '',
    ward_number: row.ward_number ?? null,
    wardNumber: row.ward_number ?? null,
    display_order: row.display_order || 0,
  };
};

/**
 * GET /api/admin/parish-council
 * Retrieves all parish council seats for admin panel.
 */
export const getAllSeatsAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureCouncilSeatsSeeded();
    const result = await pool.query(
      `${SEAT_SELECT_QUERY}
       ORDER BY
         CASE WHEN LOWER(pc.committee_type) = 'executive' THEN 0 ELSE 1 END ASC,
         pc.display_order ASC,
         COALESCE(w.ward_number, pc.ward_id, pc.id) ASC,
         pc.id ASC`
    );

    const mapped = result.rows.map(mapSeatRow);
    res.status(200).json(mapped);
  } catch (error: any) {
    console.error('Error fetching admin seats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch seats.' });
  }
};

/**
 * POST /api/admin/parish-council or /api/parish-council/seats
 * Creates a new parish council seat (strictly vacant unless a valid member_id is passed).
 */
export const createSeat = async (req: Request, res: Response): Promise<void> => {
  const {
    roleTitle, englishTitle, role_title,
    category, committee_type,
    wardNumber, ward_id,
    term, member_id, memberId,
    display_order
  } = req.body;

  const finalTitle = roleTitle || englishTitle || role_title;
  if (!finalTitle) {
    res.status(400).json({ error: 'roleTitle is required.' });
    return;
  }

  const rawCat = String(category || committee_type || 'ward_rep').toLowerCase();
  const finalCategory = rawCat === 'executive' ? 'executive' : 'ward_rep';
  const requestedMemberId = parseId(member_id || memberId);
  const targetWardId = parseId(ward_id || wardNumber);

  try {
    let validMemberId: number | null = null;
    let pName: string | null = null;
    let pPhone: string | null = null;

    if (requestedMemberId) {
      const memRes = await pool.query('SELECT id, first_name, last_name, phone_number FROM members WHERE id = $1', [requestedMemberId]);
      if (memRes.rows.length > 0) {
        const m = memRes.rows[0];
        validMemberId = m.id;
        pName = `${m.first_name || ''} ${m.last_name || ''}`.trim();
        pPhone = m.phone_number || null;
      }
    }

    const countRes = await pool.query('SELECT count(*)::int as count FROM parish_council');
    const count = countRes.rows[0].count || 0;
    const finalOrder = display_order ? parseInt(String(display_order), 10) : (finalCategory === 'executive' ? count + 1 : 100 + count + 1);
    const finalStatus = validMemberId ? 'filled' : 'vacant';

    await pool.query(
      `INSERT INTO parish_council (
         role_title, committee_type, ward_id, member_id,
         occupant_name, phone, term, status, display_order
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        finalTitle.trim(), finalCategory, targetWardId, validMemberId,
        pName, pPhone, (term || DEFAULT_TERM).trim(), finalStatus, finalOrder
      ]
    );

    const result = await pool.query(
      `${SEAT_SELECT_QUERY}
       ORDER BY
         CASE WHEN LOWER(pc.committee_type) = 'executive' THEN 0 ELSE 1 END ASC,
         pc.display_order ASC,
         COALESCE(w.ward_number, pc.ward_id, pc.id) ASC,
         pc.id ASC`
    );

    res.status(201).json(result.rows.map(mapSeatRow));
  } catch (error: any) {
    console.error('Error creating seat:', error);
    res.status(500).json({ error: error.message || 'Failed to create seat.' });
  }
};

/**
 * PUT /api/parish-council/seats/:id/assign
 * Strictly validates that member_id exists in members table before assigning the seat.
 */
export const assignSeat = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  const { memberId, member_id, term } = req.body;
  const targetMemberId = parseId(memberId || member_id);

  if (!id) {
    res.status(400).json({ error: 'Valid seat id is required.' });
    return;
  }

  if (!targetMemberId) {
    res.status(400).json({ error: 'A valid registered member_id is required to assign a seat.' });
    return;
  }

  try {
    const memRes = await pool.query(
      `SELECT m.id, m.first_name, m.last_name, m.phone_number
       FROM members m
       WHERE m.id = $1`,
      [targetMemberId]
    );

    if (memRes.rows.length === 0) {
      res.status(404).json({ error: 'Selected member does not exist in the parish directory.' });
      return;
    }

    const m = memRes.rows[0];
    const pName = `${m.first_name || ''} ${m.last_name || ''}`.trim();
    const pPhone = m.phone_number || null;

    const updateRes = await pool.query(
      `UPDATE parish_council SET
         member_id = $1,
         occupant_name = $2,
         phone = $3,
         term = COALESCE(NULLIF($4, ''), term),
         status = 'filled'
       WHERE id = $5
       RETURNING id`,
      [m.id, pName, pPhone, term ? String(term).trim() : '', id]
    );

    if (updateRes.rows.length === 0) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }

    const joined = await pool.query(`${SEAT_SELECT_QUERY} WHERE pc.id = $1`, [id]);
    res.status(200).json(mapSeatRow(joined.rows[0]));
  } catch (error: any) {
    console.error('Error assigning seat:', error);
    res.status(500).json({ error: error.message || 'Failed to assign seat.' });
  }
};

/**
 * PUT /api/parish-council/seats/:id/vacate
 * Clears member_id and returns seat to vacant state.
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
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }

    const joined = await pool.query(`${SEAT_SELECT_QUERY} WHERE pc.id = $1`, [id]);
    res.status(200).json(mapSeatRow(joined.rows[0]));
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
      SELECT COALESCE(NULLIF(TRIM(CONCAT(m.first_name, ' ', COALESCE(m.last_name, ''))), ''), pc.occupant_name) AS name,
             COALESCE(m.phone_number, pc.phone, '') AS phone
      FROM parish_council pc
      INNER JOIN members m ON pc.member_id = m.id
      WHERE pc.role_title ILIKE '%secretary%'
        AND pc.role_title NOT ILIKE '%joint%'
        AND pc.status = 'filled'
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
 * GET /api/directory/parish-council and /api/parish-council/seats
 */
export const getParishCouncilDirectory = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureCouncilSeatsSeeded();
    const result = await pool.query(
      `${SEAT_SELECT_QUERY}
       ORDER BY
         CASE WHEN LOWER(pc.committee_type) = 'executive' THEN 0 ELSE 1 END ASC,
         pc.display_order ASC,
         COALESCE(w.ward_number, pc.ward_id, pc.id) ASC,
         pc.id ASC`
    );

    const mapped = result.rows.map(mapSeatRow);
    res.status(200).json(mapped);
  } catch (error: any) {
    console.error('Error fetching parish council directory:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch directory.' });
  }
};
