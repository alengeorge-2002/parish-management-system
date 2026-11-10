import { Request, Response } from 'express';
import { pool } from '../config/db';

export interface ClergyRecord {
  id: string;
  name: string;
  role_type: string;
  designation: string | null;
  address: string | null;
  email: string | null;
  phone_number: string | null;
  blood_group: string | null;
  avatar_url: string | null;
  house_id: string | null;
  display_order?: number | null;
}

export interface LeadershipHolder {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  designation?: string | null;
  avatar_url?: string | null;
  source?: 'clergy_directory' | 'parish_council';
}

export interface ParishLeadershipStatus {
  vicar: {
    required: true;
    isFilled: boolean;
    holder: LeadershipHolder | null;
  };
  assistantVicar: {
    required: false;
    isFilled: boolean;
    holder: LeadershipHolder | null;
  };
  hasHeadOfParish: boolean;
}

let legacyTermsNormalized = false;

export const normalizeLegacyClergyTermsInDb = async (): Promise<void> => {
  if (legacyTermsNormalized) return;
  try {
    await pool.query(`
      UPDATE clergy_directory
      SET designation = 'Assistant Vicar',
          role_type = CASE WHEN LOWER(role_type) IN ('parish-priest', 'associate pastor') THEN 'Assistant Vicar' ELSE role_type END
      WHERE designation ILIKE '%Associate Pastor%' OR designation ILIKE '%Asst. Pastor%' OR role_type ILIKE '%Associate Pastor%';

      UPDATE clergy_directory
      SET designation = 'Vicar',
          role_type = CASE WHEN LOWER(role_type) IN ('parish-priest', 'senior pastor', 'pastor') THEN 'Vicar' ELSE role_type END
      WHERE designation ILIKE '%Senior Pastor%' OR TRIM(LOWER(designation)) = 'pastor';
    `);
    legacyTermsNormalized = true;
  } catch (err) {
    console.warn('normalizeLegacyClergyTermsInDb notice:', err);
  }
};

export const isAssistantVicarRecord = (c: {
  role_type?: string | null;
  designation?: string | null;
}): boolean => {
  const combined = `${c.role_type || ''} ${c.designation || ''}`.toLowerCase();
  return (
    combined.includes('assistant') ||
    combined.includes('asst') ||
    combined.includes('associate') ||
    combined.includes('സഹവികാരി')
  );
};

export const isVicarRecord = (c: {
  role_type?: string | null;
  designation?: string | null;
}): boolean => {
  if (isAssistantVicarRecord(c)) return false;
  const role = (c.role_type || '').trim().toLowerCase();
  const desig = (c.designation || '').trim().toLowerCase();
  if (
    role === 'sister' ||
    role.includes('sister') ||
    desig.includes('sister') ||
    desig.includes('principal') ||
    desig.includes('social service')
  ) {
    return false;
  }
  if (role.includes('visiting') || desig.includes('visiting')) return false;
  if (role === 'resident priest' || role === 'priest') {
    return desig.includes('vicar') || desig.includes('വികാരി');
  }
  return (
    role === 'vicar' ||
    desig.includes('vicar') ||
    desig.includes('വികാരി') ||
    role === 'parish-priest'
  );
};

export const getClergyHierarchyRank = (c: {
  role_type?: string | null;
  designation?: string | null;
}): number => {
  if (isVicarRecord(c)) return 0;
  if (isAssistantVicarRecord(c)) return 1;
  const combined = `${c.role_type || ''} ${c.designation || ''}`.toLowerCase();
  if (combined.includes('visiting')) return 3;
  if (
    combined.includes('sister') ||
    combined.includes('convent') ||
    combined.includes('principal') ||
    combined.includes('social service') ||
    combined.includes('സന്യാസിനി')
  ) {
    return 4;
  }
  return 2;
};

export const normalizeClergyRoleAndDesignation = (
  rawRole: unknown,
  rawDesignation: unknown
): { roleType: string; designation: string } => {
  let roleType = String(rawRole || '').trim();
  let designation = String(rawDesignation || '').trim();

  const replaceLegacy = (val: string): string => {
    const trimmed = val.trim();
    if (/^(associate|asst\.?|assistant)\s+pastor$/i.test(trimmed)) return 'Assistant Vicar';
    if (/^senior\s+pastor$/i.test(trimmed) || /^pastor$/i.test(trimmed)) return 'Vicar';
    return trimmed
      .replace(/\bAssociate Pastor\b/gi, 'Assistant Vicar')
      .replace(/\bSenior Pastor\b/gi, 'Vicar')
      .replace(/\bPastor\b/gi, 'Priest');
  };

  roleType = replaceLegacy(roleType);
  designation = replaceLegacy(designation);

  if (!roleType) {
    if (isAssistantVicarRecord({ designation })) roleType = 'Assistant Vicar';
    else if (isVicarRecord({ designation })) roleType = 'Vicar';
    else roleType = 'Resident Priest';
  }
  if (!designation) {
    designation = roleType;
  }
  return { roleType, designation };
};

/**
 * Verifies parish Vicar and Assistant Vicar leadership status across clergy_directory and parish_council.
 */
export const checkParishLeadershipStatus = async (): Promise<ParishLeadershipStatus> => {
  await normalizeLegacyClergyTermsInDb();

  const clergyRes = await pool.query(
    `SELECT id, name, role_type, designation, phone_number, email, avatar_url, display_order
     FROM clergy_directory
     ORDER BY display_order ASC, id ASC`
  );

  const clergyRows = clergyRes.rows || [];
  const vicarClergy = clergyRows.find(isVicarRecord) || null;
  const asstClergy = clergyRows.find(isAssistantVicarRecord) || null;

  let councilVicar: LeadershipHolder | null = null;
  let councilAsst: LeadershipHolder | null = null;

  if (!vicarClergy || !asstClergy) {
    try {
      const councilRes = await pool.query(
        `SELECT pc.id, pc.role_title, pc.occupant_name, pc.phone, pc.member_id, pc.status,
                m.first_name, m.last_name, m.phone_number as member_phone, m.email as member_email
         FROM parish_council pc
         LEFT JOIN members m ON pc.member_id = m.id
         WHERE LOWER(pc.committee_type) = 'executive'
           AND pc.role_title ILIKE '%vicar%'
         ORDER BY pc.display_order ASC, pc.id ASC`
      );
      for (const seat of councilRes.rows || []) {
        const isFilled = seat.status === 'filled' && (seat.member_id || seat.occupant_name);
        if (!isFilled) continue;
        const name = seat.member_id
          ? `${seat.first_name || ''} ${seat.last_name || ''}`.trim() || seat.occupant_name
          : seat.occupant_name;
        if (!name) continue;
        const holder: LeadershipHolder = {
          id: String(seat.member_id || seat.id),
          name,
          phone: (seat.member_phone || seat.phone || '').trim(),
          email: seat.member_email || null,
          designation: seat.role_title,
          source: 'parish_council',
        };
        const titleLower = String(seat.role_title || '').toLowerCase();
        if (titleLower.includes('assistant') || titleLower.includes('asst')) {
          if (!councilAsst) councilAsst = holder;
        } else if (!councilVicar) {
          councilVicar = holder;
        }
      }
    } catch (_) {
      // parish_council may not exist on fresh boot before init
    }
  }

  const vicarHolder: LeadershipHolder | null = vicarClergy
    ? {
        id: String(vicarClergy.id),
        name: vicarClergy.name,
        phone: vicarClergy.phone_number || '',
        email: vicarClergy.email || null,
        designation: vicarClergy.designation || vicarClergy.role_type || 'Vicar',
        avatar_url: vicarClergy.avatar_url || null,
        source: 'clergy_directory',
      }
    : councilVicar;

  const asstHolder: LeadershipHolder | null = asstClergy
    ? {
        id: String(asstClergy.id),
        name: asstClergy.name,
        phone: asstClergy.phone_number || '',
        email: asstClergy.email || null,
        designation: asstClergy.designation || asstClergy.role_type || 'Assistant Vicar',
        avatar_url: asstClergy.avatar_url || null,
        source: 'clergy_directory',
      }
    : councilAsst;

  return {
    vicar: {
      required: true,
      isFilled: Boolean(vicarHolder),
      holder: vicarHolder,
    },
    assistantVicar: {
      required: false,
      isFilled: Boolean(asstHolder),
      holder: asstHolder,
    },
    hasHeadOfParish: Boolean(vicarHolder),
  };
};

/**
 * GET /api/clergy/leadership-status
 * Returns live Vicar & Assistant Vicar occupancy status.
 */
export const getLeadershipStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const status = await checkParishLeadershipStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error('Error checking parish leadership status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/directory/clergy & /api/clergy
 * Returns all clergy directory records ordered with Vicar (Head of Parish) first,
 * Assistant Vicar second, followed by Priests and Religious Sisters.
 */
export const getClergy = async (_req: Request, res: Response): Promise<void> => {
  try {
    await normalizeLegacyClergyTermsInDb();
    const result = await pool.query(
      `SELECT *, id as _id FROM clergy_directory ORDER BY display_order ASC, id ASC`
    );

    const rows = (result.rows || []).map((row: any) => {
      const normalized = normalizeClergyRoleAndDesignation(row.role_type, row.designation);
      return {
        ...row,
        designation: normalized.designation,
        role_type: row.role_type,
      };
    });

    rows.sort((a: any, b: any) => {
      const rankDiff = getClergyHierarchyRank(a) - getClergyHierarchyRank(b);
      if (rankDiff !== 0) return rankDiff;
      const orderDiff = (a.display_order ?? 0) - (b.display_order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return Number(a.id) - Number(b.id);
    });

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching clergy directory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
