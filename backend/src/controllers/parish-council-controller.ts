import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import {
  checkParishLeadershipStatus,
  isVicarRecord,
  isAssistantVicarRecord,
  type ParishLeadershipStatus,
} from './clergy-controller';

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

export const ensureWardsSyncSchema = async (): Promise<void> => {
  try {
    await pool.query(`
      ALTER TABLE wards ADD COLUMN IF NOT EXISTS representative_phone VARCHAR(50);
      ALTER TABLE wards ADD COLUMN IF NOT EXISTS representative_id INT REFERENCES members(id) ON DELETE SET NULL;
      UPDATE wards
      SET representative_phone = contact_phone
      WHERE representative_phone IS NULL AND contact_phone IS NOT NULL;
    `);
  } catch (err) {
    console.warn('ensureWardsSyncSchema notice:', err);
  }
};

/**
 * Ensures standard designated Parish Council seats (12 Executive Committee + 1 per registered Ward)
 * are initialized cleanly without fake/dummy executive names, and syncs ward representative seats.
 */
export const ensureCouncilSeatsSeeded = async (forceCheck = false): Promise<void> => {
  if (councilSeatsEnsured && !forceCheck) return;
  try {
    await ensureWardsSyncSchema();
    const existingRes = await pool.query('SELECT id, role_title, committee_type, ward_id, member_id FROM parish_council');
    const existingRows = existingRes.rows || [];

    // Ensure no legacy dummy records without member_id stay 'filled' in executive seats
    await pool.query(
      `UPDATE parish_council
       SET occupant_name = NULL, phone = NULL, status = 'vacant'
       WHERE LOWER(committee_type) = 'executive'
         AND member_id IS NULL
         AND (status IS DISTINCT FROM 'vacant' OR occupant_name IS NOT NULL OR phone IS NOT NULL)`
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

    // 2. Dynamically create 1 representative seat for each registered ward (populating live rep if assigned on ward)
    const wardsRes = await pool.query(
      `SELECT id, ward_name, ward_number, representative_name, representative_phone, contact_phone, representative_id
       FROM wards ORDER BY COALESCE(ward_number, id) ASC`
    );
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
        const repName =
          w.representative_name && w.representative_name.trim().toLowerCase() !== 'unassigned'
            ? w.representative_name.trim()
            : null;
        const repPhone = (w.representative_phone || w.contact_phone || '').trim() || null;
        const repMemberId = w.representative_id || null;
        const initStatus = repName || repMemberId ? 'filled' : 'vacant';

        await pool.query(
          `INSERT INTO parish_council (
             role_title, committee_type, ward_id, member_id,
             occupant_name, phone, term, status, display_order
           ) VALUES ($1, 'ward_rep', $2, $3, $4, $5, $6, $7, $8)`,
          [seatTitle, w.id, repMemberId, repName, repPhone, DEFAULT_TERM, initStatus, orderNum]
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
         w.ward_name, w.ward_number,
         w.representative_name as ward_rep_name,
         w.representative_phone as ward_rep_phone,
         w.contact_phone as ward_contact_phone,
         w.representative_id as ward_rep_id,
         wm.id as wm_member_id, wm.first_name as wm_first_name, wm.last_name as wm_last_name,
         wm.phone_number as wm_phone_number, wm.email as wm_email,
         wf.house_name as wm_house_name, wf.family_name as wm_family_name
  FROM parish_council pc
  LEFT JOIN members m ON pc.member_id = m.id
  LEFT JOIN families f ON m.family_id = f.id
  LEFT JOIN wards w ON pc.ward_id = w.id
  LEFT JOIN members wm ON w.representative_id = wm.id
  LEFT JOIN families wf ON wm.family_id = wf.id
`;

const clergyTargetForSeatTitle = (roleTitle?: string | null): 'Vicar' | 'Assistant Vicar' | null => {
  const lower = String(roleTitle || '').toLowerCase();
  if (!lower.includes('vicar')) return null;
  if (lower.includes('assistant') || lower.includes('asst')) return 'Assistant Vicar';
  return 'Vicar';
};

const mapSeatRow = (row: any, leadership?: ParishLeadershipStatus) => {
  const normalizedCategory =
    (row.committee_type || '').toLowerCase() === 'executive' ? 'executive' : 'ward_rep';
  const clergyRoleTarget = normalizedCategory === 'executive' ? clergyTargetForSeatTitle(row.role_title) : null;

  let isFilled = false;
  let fullName: string | null = null;
  let houseName: string | null = null;
  let phone: string | null = null;
  let email: string | null = null;
  let linkedMemberId: string | null = null;
  let linkedClergyId: string | null = null;

  if (clergyRoleTarget && leadership) {
    const slot = clergyRoleTarget === 'Vicar' ? leadership.vicar : leadership.assistantVicar;
    if (slot.isFilled && slot.holder && slot.holder.source === 'clergy_directory') {
      isFilled = true;
      fullName = slot.holder.name;
      phone = slot.holder.phone || null;
      email = slot.holder.email || null;
      houseName =
        clergyRoleTarget === 'Vicar'
          ? 'Head of Parish / വികാരി'
          : 'Vice President / സഹവികാരി';
      linkedClergyId = String(slot.holder.id);
    } else if (row.real_member_id) {
      isFilled = true;
      fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim();
      houseName = row.house_name || row.family_name || null;
      phone = row.phone_number || row.phone || null;
      email = row.email || null;
      linkedMemberId = String(row.real_member_id);
    }
  } else if (normalizedCategory === 'ward_rep' && row.ward_id) {
    const wardRepName =
      row.ward_rep_name && row.ward_rep_name.trim().toLowerCase() !== 'unassigned'
        ? row.ward_rep_name.trim()
        : null;
    const wardRepPhone =
      (row.ward_rep_phone && row.ward_rep_phone.trim()) ||
      (row.ward_contact_phone && row.ward_contact_phone.trim()) ||
      null;
    const resolvedMemberId = row.real_member_id || row.wm_member_id || row.ward_rep_id || null;
    const memberFullName = row.real_member_id
      ? `${row.first_name || ''} ${row.last_name || ''}`.trim()
      : row.wm_member_id
        ? `${row.wm_first_name || ''} ${row.wm_last_name || ''}`.trim()
        : null;

    fullName = wardRepName || memberFullName || null;
    phone =
      wardRepPhone ||
      (row.real_member_id ? row.phone_number : row.wm_phone_number) ||
      (row.phone && row.phone.trim()) ||
      null;
    houseName = row.real_member_id
      ? row.house_name || row.family_name || null
      : row.wm_house_name || row.wm_family_name || null;
    email = row.real_member_id ? row.email || null : row.wm_email || null;
    linkedMemberId = resolvedMemberId ? String(resolvedMemberId) : null;
    isFilled = Boolean(fullName || linkedMemberId);
  } else {
    isFilled = Boolean(row.real_member_id);
    fullName = isFilled ? `${row.first_name || ''} ${row.last_name || ''}`.trim() : null;
    houseName = isFilled ? row.house_name || row.family_name || null : null;
    phone = isFilled ? row.phone_number || row.phone || null : null;
    email = isFilled ? row.email || null : null;
    linkedMemberId = isFilled ? String(row.real_member_id) : null;
  }

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
    member_id: linkedMemberId,
    clergy_id: linkedClergyId,
    clergyId: linkedClergyId,
    is_clergy_seat: Boolean(clergyRoleTarget),
    isClergySeat: Boolean(clergyRoleTarget),
    clergy_role_target: clergyRoleTarget,
    clergyRoleTarget,
    occupant_name: fullName,
    occupantName: fullName,
    first_name: isFilled ? (row.first_name || row.wm_first_name || '') : '',
    last_name: isFilled ? (row.last_name || row.wm_last_name || '') : '',
    house_name: houseName,
    houseName: houseName,
    phone,
    phone_number: phone,
    email,
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
    const [result, leadership] = await Promise.all([
      pool.query(
        `${SEAT_SELECT_QUERY}
         ORDER BY
           CASE WHEN LOWER(pc.committee_type) = 'executive' THEN 0 ELSE 1 END ASC,
           pc.display_order ASC,
           COALESCE(w.ward_number, pc.ward_id, pc.id) ASC,
           pc.id ASC`
      ),
      checkParishLeadershipStatus(),
    ]);

    const mapped = result.rows.map((row: any) => mapSeatRow(row, leadership));
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

    const [result, leadership] = await Promise.all([
      pool.query(
        `${SEAT_SELECT_QUERY}
         ORDER BY
           CASE WHEN LOWER(pc.committee_type) = 'executive' THEN 0 ELSE 1 END ASC,
           pc.display_order ASC,
           COALESCE(w.ward_number, pc.ward_id, pc.id) ASC,
           pc.id ASC`
      ),
      checkParishLeadershipStatus(),
    ]);

    res.status(201).json(result.rows.map((row: any) => mapSeatRow(row, leadership)));
  } catch (error: any) {
    console.error('Error creating seat:', error);
    res.status(500).json({ error: error.message || 'Failed to create seat.' });
  }
};

/**
 * PUT /api/parish-council/seats/:id/assign
 * Assigns a registered parishioner (or updated ward representative details) and keeps wards table synced.
 */
export const assignSeat = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  const {
    memberId,
    member_id,
    clergyId,
    clergy_id,
    occupantName,
    occupant_name,
    representativeName,
    representative_name,
    phone,
    representative_phone,
    term,
  } = req.body;
  const targetMemberId = parseId(memberId || member_id);
  const targetClergyId = parseId(clergyId || clergy_id);

  if (!id) {
    res.status(400).json({ error: 'Valid seat id is required.' });
    return;
  }

  try {
    await ensureWardsSyncSchema();
    const seatRes = await pool.query('SELECT * FROM parish_council WHERE id = $1', [id]);
    if (seatRes.rows.length === 0) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }
    const seat = seatRes.rows[0];
    const hasWardLink = Boolean(seat.ward_id);
    const clergyTarget = clergyTargetForSeatTitle(seat.role_title);

    // Handle direct promotion/assignment from Clergy Directory for Vicar / Assistant Vicar seats
    if (clergyTarget && targetClergyId) {
      const clergyRes = await pool.query('SELECT * FROM clergy_directory WHERE id = $1', [targetClergyId]);
      if (clergyRes.rows.length === 0) {
        res.status(404).json({ error: 'Selected clergy profile does not exist.' });
        return;
      }

      const existingClergy = await pool.query('SELECT * FROM clergy_directory WHERE id != $1', [targetClergyId]);
      for (const row of existingClergy.rows || []) {
        const shouldDemote =
          (clergyTarget === 'Vicar' && isVicarRecord(row)) ||
          (clergyTarget === 'Assistant Vicar' && isAssistantVicarRecord(row));
        if (shouldDemote) {
          await pool.query(
            `UPDATE clergy_directory SET role_type = 'Resident Priest', designation = 'Resident Priest', display_order = 10 WHERE id = $1`,
            [row.id]
          );
        }
      }

      const nextOrder = clergyTarget === 'Vicar' ? 1 : 2;
      await pool.query(
        `UPDATE clergy_directory SET role_type = $1, designation = $1, display_order = $2 WHERE id = $3`,
        [clergyTarget, nextOrder, targetClergyId]
      );

      if (term && String(term).trim()) {
        await pool.query(`UPDATE parish_council SET term = $1 WHERE id = $2`, [String(term).trim(), id]);
      }

      const [joined, leadership] = await Promise.all([
        pool.query(`${SEAT_SELECT_QUERY} WHERE pc.id = $1`, [id]),
        checkParishLeadershipStatus(),
      ]);
      res.status(200).json(mapSeatRow(joined.rows[0], leadership));
      return;
    }

    const explicitName = (occupantName || occupant_name || representativeName || representative_name || '').trim();
    const explicitPhone = (phone || representative_phone || '').trim();

    let finalMemberId: number | null = null;
    let finalName: string | null = explicitName || null;
    let finalPhone: string | null = explicitPhone || null;

    if (targetMemberId) {
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
      finalMemberId = m.id;
      finalName = finalName || `${m.first_name || ''} ${m.last_name || ''}`.trim();
      finalPhone = finalPhone || m.phone_number || null;
    } else if (!hasWardLink || !finalName) {
      res.status(400).json({ error: 'A valid registered member_id or clergy_id is required to assign a seat.' });
      return;
    }

    await pool.query(
      `UPDATE parish_council SET
         member_id = $1,
         occupant_name = $2,
         phone = $3,
         term = COALESCE(NULLIF($4, ''), term),
         status = 'filled'
       WHERE id = $5`,
      [finalMemberId, finalName, finalPhone, term ? String(term).trim() : '', id]
    );

    // Two-way sync back to wards table if this seat represents a Ward
    if (hasWardLink) {
      await pool.query(
        `UPDATE wards SET
           representative_name = $1,
           representative_phone = $2,
           contact_phone = $2,
           representative_id = $3
         WHERE id = $4`,
        [finalName, finalPhone, finalMemberId, seat.ward_id]
      );
    }

    const [joined, leadership] = await Promise.all([
      pool.query(`${SEAT_SELECT_QUERY} WHERE pc.id = $1`, [id]),
      checkParishLeadershipStatus(),
    ]);
    res.status(200).json(mapSeatRow(joined.rows[0], leadership));
  } catch (error: any) {
    console.error('Error assigning seat:', error);
    res.status(500).json({ error: error.message || 'Failed to assign seat.' });
  }
};

/**
 * PUT /api/parish-council/seats/:id/vacate
 * Clears member_id and returns seat (plus linked ward representative if ward_id present) to vacant state.
 */
export const vacateSeat = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'Valid id required' });
    return;
  }

  try {
    await ensureWardsSyncSchema();
    const seatCheck = await pool.query('SELECT * FROM parish_council WHERE id = $1', [id]);
    if (seatCheck.rows.length === 0) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }

    const seatRow = seatCheck.rows[0];
    const clergyTarget = clergyTargetForSeatTitle(seatRow.role_title);
    if (clergyTarget === 'Vicar') {
      const leadership = await checkParishLeadershipStatus();
      if (leadership.vicar.isFilled) {
        res.status(409).json({
          error: 'Warning: A parish must have a designated Vicar as its head.',
          code: 'VICAR_REQUIRED',
        });
        return;
      }
    } else if (clergyTarget === 'Assistant Vicar') {
      const clergyRes = await pool.query('SELECT * FROM clergy_directory');
      for (const c of clergyRes.rows || []) {
        if (isAssistantVicarRecord(c)) {
          await pool.query(
            `UPDATE clergy_directory SET role_type = 'Resident Priest', designation = 'Resident Priest', display_order = 10 WHERE id = $1`,
            [c.id]
          );
        }
      }
    }

    const result = await pool.query(
      `UPDATE parish_council SET
         member_id = NULL,
         occupant_name = NULL,
         phone = NULL,
         status = 'vacant'
       WHERE id = $1
       RETURNING id, ward_id`,
      [id]
    );

    const wardId = result.rows[0].ward_id;
    if (wardId) {
      await pool.query(
        `UPDATE wards SET
           representative_name = NULL,
           representative_phone = NULL,
           contact_phone = NULL,
           representative_id = NULL
         WHERE id = $1`,
        [wardId]
      );
    }

    const [joined, leadership] = await Promise.all([
      pool.query(`${SEAT_SELECT_QUERY} WHERE pc.id = $1`, [id]),
      checkParishLeadershipStatus(),
    ]);
    res.status(200).json(mapSeatRow(joined.rows[0], leadership));
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
    const [leadership, councilSecretaryRes, clergySecretaryRes] = await Promise.all([
      checkParishLeadershipStatus(),
      pool.query(`
        SELECT COALESCE(NULLIF(TRIM(CONCAT(m.first_name, ' ', COALESCE(m.last_name, ''))), ''), pc.occupant_name) AS name,
               COALESCE(m.phone_number, pc.phone, '') AS phone
        FROM parish_council pc
        INNER JOIN members m ON pc.member_id = m.id
        WHERE pc.role_title ILIKE '%secretary%'
          AND pc.role_title NOT ILIKE '%joint%'
          AND pc.status = 'filled'
        ORDER BY pc.display_order ASC, pc.id ASC
        LIMIT 1
      `).catch(() => ({ rows: [] })),
      pool.query(`
        SELECT name, COALESCE(phone_number, '') AS phone
        FROM clergy_directory
        WHERE designation ILIKE '%secretary%' OR role_type ILIKE '%secretary%'
        ORDER BY display_order ASC, id ASC LIMIT 1
      `).catch(() => ({ rows: [] })),
    ]);

    const vicarName = leadership.vicar.holder?.name?.trim() || DEFAULT_CONTACTS.vicar.name;
    const vicarPhone = leadership.vicar.holder?.phone?.trim() || DEFAULT_CONTACTS.vicar.phone;

    const asstName = leadership.assistantVicar.holder?.name?.trim() || DEFAULT_CONTACTS.assistantVicar.name;
    const asstPhone = leadership.assistantVicar.holder?.phone?.trim() || DEFAULT_CONTACTS.assistantVicar.phone;

    const secRow = councilSecretaryRes.rows[0]?.phone?.trim()
      ? councilSecretaryRes.rows[0]
      : clergySecretaryRes.rows[0]?.phone?.trim()
        ? clergySecretaryRes.rows[0]
        : councilSecretaryRes.rows[0] || clergySecretaryRes.rows[0];
    const secName = secRow?.name?.trim() || DEFAULT_CONTACTS.secretary.name;
    const secPhone = secRow?.phone && secRow.phone.trim() !== '' ? secRow.phone.trim() : DEFAULT_CONTACTS.secretary.phone;

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
    const [result, leadership] = await Promise.all([
      pool.query(
        `${SEAT_SELECT_QUERY}
         ORDER BY
           CASE WHEN LOWER(pc.committee_type) = 'executive' THEN 0 ELSE 1 END ASC,
           pc.display_order ASC,
           COALESCE(w.ward_number, pc.ward_id, pc.id) ASC,
           pc.id ASC`
      ),
      checkParishLeadershipStatus(),
    ]);

    const mapped = result.rows.map((row: any) => mapSeatRow(row, leadership));
    res.status(200).json(mapped);
  } catch (error: any) {
    console.error('Error fetching parish council directory:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch directory.' });
  }
};
