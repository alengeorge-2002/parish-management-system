import { Request, Response } from 'express';
import { pool } from '../config/db';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  contact: string;
  category: 'Parishioner' | 'Family Head' | 'Family' | 'Clergy & Priests' | 'Religious House' | 'Parish Council';
  route: string;
}

/**
 * GET /api/search?q=:query
 * Performs parameterized case-insensitive search across parishioners, families,
 * clergy directory, religious houses, and parish council members.
 */
export const universalSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
    const trimmed = rawQuery.trim();

    if (trimmed.length < 2) {
      res.status(200).json([]);
      return;
    }

    const pattern = `%${trimmed}%`;

    const [membersRes, familiesRes, clergyRes, housesRes, councilRes] = await Promise.all([
      pool.query(
        `SELECT m.id, m.first_name, m.last_name, m.phone_number, m.is_head_of_household,
                f.id as family_id, f.family_name, f.house_name, f.contact_number as family_phone,
                w.ward_number, w.ward_name
         FROM members m
         LEFT JOIN families f ON m.family_id = f.id
         LEFT JOIN wards w ON f.ward_id = w.id
         WHERE m.first_name ILIKE $1
            OR m.last_name ILIKE $1
            OR CONCAT(m.first_name, ' ', m.last_name) ILIKE $1
            OR COALESCE(m.phone_number, '') ILIKE $1
            OR COALESCE(f.family_name, '') ILIKE $1
            OR COALESCE(f.house_name, '') ILIKE $1
            OR COALESCE(w.ward_name, '') ILIKE $1
         ORDER BY m.is_head_of_household DESC, m.first_name ASC
         LIMIT 12`,
        [pattern]
      ).catch(() => ({ rows: [] })),

      pool.query(
        `SELECT f.id, f.family_name, f.house_name, f.head_of_family, f.contact_number,
                w.ward_number, w.ward_name
         FROM families f
         LEFT JOIN wards w ON f.ward_id = w.id
         WHERE f.family_name ILIKE $1
            OR f.house_name ILIKE $1
            OR COALESCE(f.head_of_family, '') ILIKE $1
            OR COALESCE(f.contact_number, '') ILIKE $1
            OR COALESCE(w.ward_name, '') ILIKE $1
         ORDER BY f.house_name ASC
         LIMIT 6`,
        [pattern]
      ).catch(() => ({ rows: [] })),

      pool.query(
        `SELECT id, name, designation, phone_number, role_type, address
         FROM clergy_directory
         WHERE name ILIKE $1
            OR COALESCE(designation, '') ILIKE $1
            OR COALESCE(phone_number, '') ILIKE $1
            OR COALESCE(role_type, '') ILIKE $1
         ORDER BY display_order ASC, id ASC
         LIMIT 8`,
        [pattern]
      ).catch(() => ({ rows: [] })),

      pool.query(
        `SELECT id, name, superior_in_charge, contact_number, address
         FROM religious_houses
         WHERE name ILIKE $1
            OR COALESCE(superior_in_charge, '') ILIKE $1
            OR COALESCE(contact_number, '') ILIKE $1
            OR COALESCE(address, '') ILIKE $1
            OR COALESCE(residents::text, '') ILIKE $1
         ORDER BY name ASC
         LIMIT 8`,
        [pattern]
      ).catch(() => ({ rows: [] })),

      pool.query(
        `SELECT pc.id, pc.role_title, pc.occupant_name, pc.phone, pc.status,
                m.first_name, m.last_name, m.phone_number as member_phone,
                w.ward_name, w.ward_number, w.representative_name,
                w.representative_phone, w.contact_phone as ward_contact_phone
         FROM parish_council pc
         LEFT JOIN members m ON pc.member_id = m.id
         LEFT JOIN wards w ON pc.ward_id = w.id
         WHERE pc.role_title ILIKE $1
            OR COALESCE(pc.occupant_name, '') ILIKE $1
            OR COALESCE(m.first_name, '') ILIKE $1
            OR COALESCE(m.last_name, '') ILIKE $1
            OR CONCAT(COALESCE(m.first_name, ''), ' ', COALESCE(m.last_name, '')) ILIKE $1
            OR COALESCE(m.phone_number, '') ILIKE $1
            OR COALESCE(pc.phone, '') ILIKE $1
            OR COALESCE(w.ward_name, '') ILIKE $1
            OR COALESCE(w.representative_name, '') ILIKE $1
         ORDER BY pc.display_order ASC, pc.id ASC
         LIMIT 8`,
        [pattern]
      ).catch(() => ({ rows: [] })),
    ]);

    const results: SearchResultItem[] = [];

    // 1. Parishioners
    for (const row of membersRes.rows) {
      const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Parishioner';
      const housePart = row.house_name || row.family_name || 'Parish Household';
      const wardPart = row.ward_number
        ? `Ward #${row.ward_number}${row.ward_name ? ` (${row.ward_name})` : ''}`
        : row.ward_name || '';
      const subtitle = wardPart ? `${housePart} · ${wardPart}` : housePart;

      results.push({
        id: `m-${row.id}`,
        title: fullName,
        subtitle,
        contact: row.phone_number || row.family_phone || '',
        category: row.is_head_of_household ? 'Family Head' : 'Parishioner',
        route: `/members?id=${row.id}`,
      });
    }

    // 1b. Matching Families (direct household links)
    for (const row of familiesRes.rows) {
      const title = row.house_name || row.family_name || 'Household';
      const wardPart = row.ward_number
        ? `Ward #${row.ward_number}${row.ward_name ? ` (${row.ward_name})` : ''}`
        : row.ward_name || '';
      const subtitleParts = [];
      if (row.head_of_family && row.head_of_family.toLowerCase() !== 'unassigned') {
        subtitleParts.push(`Head: ${row.head_of_family}`);
      }
      if (wardPart) subtitleParts.push(wardPart);

      results.push({
        id: `f-${row.id}`,
        title,
        subtitle: subtitleParts.join(' · ') || 'Registered Family Unit',
        contact: row.contact_number || '',
        category: 'Family',
        route: `/families?id=${row.id}`,
      });
    }

    // 2. Clergy & Priests
    for (const row of clergyRes.rows) {
      const sub = [row.designation || row.role_type, row.address].filter(Boolean).join(' · ') || 'Parish Clergy';
      results.push({
        id: `c-${row.id}`,
        title: row.name,
        subtitle: sub,
        contact: row.phone_number || '',
        category: 'Clergy & Priests',
        route: '/clergy',
      });
    }

    // 3. Religious Houses
    for (const row of housesRes.rows) {
      const subParts = [];
      if (row.superior_in_charge) subParts.push(`Superior: ${row.superior_in_charge}`);
      if (row.address) subParts.push(row.address);
      results.push({
        id: `rh-${row.id}`,
        title: row.name,
        subtitle: subParts.join(' · ') || 'Religious House',
        contact: row.contact_number || '',
        category: 'Religious House',
        route: '/religious-houses',
      });
    }

    // 4. Parish Council
    for (const row of councilRes.rows) {
      const memberName = row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : '';
      const wardRepName =
        row.representative_name && row.representative_name.trim().toLowerCase() !== 'unassigned'
          ? row.representative_name.trim()
          : '';
      const holderName = (row.occupant_name || memberName || wardRepName).trim();
      const seatTitle = (row.role_title || 'Council Seat').split(' / ')[0].trim();
      const phone = row.member_phone || row.phone || row.representative_phone || row.ward_contact_phone || '';

      results.push({
        id: `pc-${row.id}`,
        title: holderName || seatTitle,
        subtitle: holderName
          ? `${seatTitle}${row.ward_name ? ` · ${row.ward_name}` : ''}`
          : `Vacant Seat${row.ward_name ? ` · ${row.ward_name}` : ''}`,
        contact: phone,
        category: 'Parish Council',
        route: '/parish-council',
      });
    }

    res.status(200).json(results);
  } catch (error: any) {
    console.error('Error in universalSearch:', error);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
};

