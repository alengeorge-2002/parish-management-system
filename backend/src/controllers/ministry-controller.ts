import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

/**
 * Public directory: Fetches all ministries with their aggregated counts and members
 */
export const getMinistriesDirectory = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT *, id as _id FROM organizations WHERE category = 'ministry' ORDER BY title ASC, name_en ASC`
    );

    const mapped = result.rows.map((mObj: any) => {
      const members = Array.isArray(mObj.members) ? mObj.members : [];
      return {
        ...mObj,
        id: String(mObj.id),
        _id: String(mObj.id),
        title: mObj.title || mObj.name_en || '',
        member_count: members.length,
        members,
      };
    });

    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Get all ministries
 */
export const getAllMinistriesAdmin = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT *, id as _id FROM organizations WHERE category = 'ministry' ORDER BY title ASC, name_en ASC`
    );
    const mapped = result.rows.map((row: any) => ({
      ...row,
      id: String(row.id),
      _id: String(row.id),
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Create a new ministry
 */
export const createMinistry = async (req: Request, res: Response): Promise<any> => {
  const { title, name_en, description, icon_symbol } = req.body;
  const ministryTitle = title || name_en;
  if (!ministryTitle) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO organizations (category, title, name_en, description, icon_symbol, members)
       VALUES ('ministry', $1, $1, $2, $3, '[]'::jsonb)
       RETURNING *, id as _id`,
      [ministryTitle.trim(), description || null, icon_symbol || null]
    );
    const row = result.rows[0];
    res.status(201).json({ ...row, id: String(row.id), _id: String(row.id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Update a ministry
 */
export const updateMinistry = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  const { title, name_en, description, icon_symbol } = req.body;
  const ministryTitle = title || name_en;
  if (!ministryTitle) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const result = await pool.query(
      `UPDATE organizations SET
         title = $1, name_en = $1, description = $2, icon_symbol = $3
       WHERE id = $4
       RETURNING *, id as _id`,
      [ministryTitle.trim(), description || null, icon_symbol || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ministry not found' });
    }
    const row = result.rows[0];
    res.json({ ...row, id: String(row.id), _id: String(row.id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Delete a ministry
 */
export const deleteMinistry = async (req: Request, res: Response): Promise<any> => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid id required' });

  try {
    const result = await pool.query('DELETE FROM organizations WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ministry not found' });
    }
    res.json({ message: 'Ministry deleted successfully', deleted: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Get all ministry memberships
 */
export const getMinistryMembersAdmin = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, title, name_en, members FROM organizations WHERE category = 'ministry'`
    );

    const allMembers: any[] = [];
    result.rows.forEach((mObj: any) => {
      const members = Array.isArray(mObj.members) ? mObj.members : [];
      members.forEach((mem: any) => {
        allMembers.push({
          id: String(mem.id || mem.assignment_id || mem._id || Math.random()),
          assignment_id: String(mem.id || mem.assignment_id || mem._id),
          ministry_id: String(mObj.id),
          member_id: mem.member_id ? String(mem.member_id) : null,
          role_title: mem.role_title || mem.role || 'Member',
          display_order: mem.display_order || 0,
          first_name: mem.first_name || '',
          last_name: mem.last_name || '',
          ministry_title: mObj.title || mObj.name_en || '',
        });
      });
    });

    res.json(allMembers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Create a new ministry membership
 */
export const createMinistryMember = async (req: Request, res: Response): Promise<any> => {
  const { ministry_id, member_id, role_title, display_order } = req.body;
  const mId = parseId(ministry_id);
  if (!mId || !member_id || !role_title) {
    return res.status(400).json({ error: 'ministry_id, member_id, and role_title are required' });
  }
  try {
    const memRes = await pool.query('SELECT first_name, last_name, phone_number, email FROM members WHERE id = $1', [parseId(member_id)]);
    const memRow = memRes.rows[0] || {};

    const newMember = {
      id: Date.now(),
      assignment_id: Date.now(),
      member_id: parseId(member_id),
      role_title,
      role: role_title,
      display_order: display_order || 0,
      first_name: memRow.first_name || '',
      last_name: memRow.last_name || '',
      phone_number: memRow.phone_number || null,
      email: memRow.email || null,
    };

    await pool.query(
      `UPDATE organizations
       SET members = COALESCE(members, '[]'::jsonb) || $1::jsonb
       WHERE id = $2`,
      [JSON.stringify([newMember]), mId]
    );

    res.status(201).json(newMember);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Update a ministry membership
 */
export const updateMinistryMember = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { role_title, display_order } = req.body;
  try {
    const result = await pool.query(
      `SELECT id, members FROM organizations WHERE category = 'ministry'`
    );

    for (const org of result.rows) {
      const members = Array.isArray(org.members) ? org.members : [];
      const idx = members.findIndex((m: any) => String(m.id || m.assignment_id || m._id) === String(id));
      if (idx !== -1) {
        if (role_title) {
          members[idx].role_title = role_title;
          members[idx].role = role_title;
        }
        if (display_order !== undefined) {
          members[idx].display_order = display_order;
        }
        await pool.query('UPDATE organizations SET members = $1 WHERE id = $2', [JSON.stringify(members), org.id]);
        return res.json(members[idx]);
      }
    }

    res.status(404).json({ error: 'Membership not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Delete a ministry membership
 */
export const deleteMinistryMember = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, members FROM organizations WHERE category = 'ministry'`
    );

    for (const org of result.rows) {
      const members = Array.isArray(org.members) ? org.members : [];
      const filtered = members.filter((m: any) => String(m.id || m.assignment_id || m._id) !== String(id));
      if (filtered.length !== members.length) {
        await pool.query('UPDATE organizations SET members = $1 WHERE id = $2', [JSON.stringify(filtered), org.id]);
        return res.json({ message: 'Membership deleted successfully' });
      }
    }

    res.status(404).json({ error: 'Membership not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Route: POST /api/ministries/:id/members
 */
export const addMemberToMinistry = async (req: Request, res: Response): Promise<any> => {
  const mId = parseId(req.params.id);
  const { memberId, member_id, role, role_title } = req.body;
  const targetMemberId = parseId(memberId || member_id);
  const targetRole = role || role_title || 'Member';

  if (!mId || !targetMemberId) {
    return res.status(400).json({ error: 'valid ministry id and memberId are required' });
  }

  try {
    const memRes = await pool.query('SELECT first_name, last_name, phone_number, email FROM members WHERE id = $1', [targetMemberId]);
    const memRow = memRes.rows[0] || {};

    const newMember = {
      id: Date.now(),
      assignment_id: Date.now(),
      member_id: targetMemberId,
      role: targetRole,
      role_title: targetRole,
      first_name: memRow.first_name || '',
      last_name: memRow.last_name || '',
      phone_number: memRow.phone_number || null,
      email: memRow.email || null,
      display_order: 1,
    };

    const updateRes = await pool.query(
      `UPDATE organizations
       SET members = COALESCE(members, '[]'::jsonb) || $1::jsonb
       WHERE id = $2
       RETURNING *, id as _id`,
      [JSON.stringify([newMember]), mId]
    );

    if (updateRes.rows.length === 0) return res.status(404).json({ error: 'Ministry not found' });
    res.status(201).json(updateRes.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Route: DELETE /api/ministries/:id/members/:memberId
 */
export const removeMemberFromMinistry = async (req: Request, res: Response): Promise<any> => {
  const mId = parseId(req.params.id);
  const targetId = req.params.memberId;
  if (!mId) return res.status(400).json({ error: 'Valid id required' });

  try {
    const orgRes = await pool.query('SELECT members FROM organizations WHERE id = $1', [mId]);
    if (orgRes.rows.length === 0) return res.status(404).json({ error: 'Ministry not found' });

    const members = Array.isArray(orgRes.rows[0].members) ? orgRes.rows[0].members : [];
    const filtered = members.filter((m: any) =>
      String(m.id || m.assignment_id || m.member_id) !== String(targetId)
    );

    const updateRes = await pool.query(
      'UPDATE organizations SET members = $1 WHERE id = $2 RETURNING *, id as _id',
      [JSON.stringify(filtered), mId]
    );

    res.json(updateRes.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
