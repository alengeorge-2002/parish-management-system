import { Request, Response } from 'express';
import { Organization, Parishioner } from '../models';

/**
 * Public directory: Fetches all ministries with their aggregated counts and members
 */
export const getMinistriesDirectory = async (req: Request, res: Response) => {
  try {
    const ministries = await Organization.find({ category: 'ministry' })
      .populate({
        path: 'members.parishioner',
        model: 'Parishioner',
      })
      .populate({
        path: 'members.member_id',
        model: 'Parishioner',
      })
      .sort({ title: 1, name_en: 1 });

    const result = ministries.map((m: any) => {
      const mObj = m.toObject ? m.toObject() : m;
      const members = (mObj.members || []).map((mem: any) => {
        const p = mem.parishioner || mem.member_id || {};
        return {
          assignment_id: mem._id ? mem._id.toString() : mem.id,
          ministry_id: mObj._id ? mObj._id.toString() : mObj.id,
          role_title: mem.role_title || mem.role || 'Member',
          display_order: mem.display_order || 0,
          member_id: p._id ? p._id.toString() : (p.id || null),
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          phone_number: p.phone_number || null,
          email: p.email || null,
        };
      });

      return {
        ...mObj,
        id: mObj._id ? mObj._id.toString() : mObj.id,
        title: mObj.title || mObj.name_en || '',
        member_count: members.length,
        members,
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Get all ministries
 */
export const getAllMinistriesAdmin = async (req: Request, res: Response) => {
  try {
    const list = await Organization.find({ category: 'ministry' }).sort({ title: 1, name_en: 1 });
    res.json(list);
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
    const ministry = await Organization.create({
      category: 'ministry',
      title: ministryTitle,
      name_en: ministryTitle,
      description: description || null,
      icon_symbol: icon_symbol || null,
      members: [],
    });
    res.status(201).json(ministry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Update a ministry
 */
export const updateMinistry = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { title, name_en, description, icon_symbol } = req.body;
  const ministryTitle = title || name_en;
  if (!ministryTitle) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const updated = await Organization.findByIdAndUpdate(
      id,
      {
        title: ministryTitle,
        name_en: ministryTitle,
        description: description || null,
        icon_symbol: icon_symbol || null,
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Ministry not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Delete a ministry
 */
export const deleteMinistry = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const deleted = await Organization.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Ministry not found' });
    }
    res.json({ message: 'Ministry deleted successfully', deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Get all ministry memberships
 */
export const getMinistryMembersAdmin = async (req: Request, res: Response) => {
  try {
    const ministries = await Organization.find({ category: 'ministry' })
      .populate({ path: 'members.parishioner' })
      .populate({ path: 'members.member_id' });

    const allMembers: any[] = [];
    ministries.forEach((m: any) => {
      const mObj = m.toObject ? m.toObject() : m;
      (mObj.members || []).forEach((mem: any) => {
        const p = mem.parishioner || mem.member_id || {};
        allMembers.push({
          id: mem._id ? mem._id.toString() : mem.id,
          ministry_id: mObj._id ? mObj._id.toString() : mObj.id,
          member_id: p._id ? p._id.toString() : (p.id || null),
          role_title: mem.role_title || mem.role || 'Member',
          display_order: mem.display_order || 0,
          first_name: p.first_name || '',
          last_name: p.last_name || '',
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
  if (!ministry_id || !member_id || !role_title) {
    return res.status(400).json({ error: 'ministry_id, member_id, and role_title are required' });
  }
  try {
    const ministry = await Organization.findById(ministry_id);
    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    const newMember = {
      parishioner: member_id,
      member_id: member_id,
      role: role_title,
      role_title: role_title,
      display_order: display_order || 0,
    };

    ministry.members.push(newMember as any);
    await ministry.save();

    res.status(201).json(ministry.members[ministry.members.length - 1]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: Update a ministry membership
 */
export const updateMinistryMember = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { role_title, display_order, ministry_id, member_id } = req.body;
  if (!role_title) {
    return res.status(400).json({ error: 'role_title is required' });
  }
  try {
    const ministry = await Organization.findOne({ 'members._id': id });
    if (!ministry) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    const memItem = ministry.members.find((m: any) => m._id.toString() === id);
    if (memItem) {
      memItem.role = role_title;
      memItem.role_title = role_title;
      if (display_order !== undefined) memItem.display_order = display_order;
      if (member_id) {
        memItem.parishioner = member_id as any;
        memItem.member_id = member_id as any;
      }
      await ministry.save();
      return res.json(memItem);
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
    const ministry = await Organization.findOne({ 'members._id': id });
    if (!ministry) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    ministry.members = ministry.members.filter((m: any) => m._id.toString() !== id) as any;
    await ministry.save();

    res.json({ message: 'Membership deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Route: POST /api/ministries/:id/members or /api/admin/ministries/:id/members
 */
export const addMemberToMinistry = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { memberId, member_id, role, role_title } = req.body;
  const targetMemberId = memberId || member_id;
  const targetRole = role || role_title || 'Member';

  if (!targetMemberId) {
    return res.status(400).json({ error: 'memberId is required' });
  }

  try {
    const ministry = await Organization.findById(id);
    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    const newMember = {
      parishioner: targetMemberId,
      member_id: targetMemberId,
      role: targetRole,
      role_title: targetRole,
      display_order: ministry.members.length + 1,
    };

    ministry.members.push(newMember as any);
    await ministry.save();

    const updatedMinistry = await Organization.findById(id)
      .populate({ path: 'members.parishioner' })
      .populate({ path: 'members.member_id' });

    res.status(201).json(updatedMinistry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Route: DELETE /api/ministries/:id/members/:memberId
 */
export const removeMemberFromMinistry = async (req: Request, res: Response): Promise<any> => {
  const { id, memberId } = req.params;
  try {
    const ministry = await Organization.findById(id);
    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    ministry.members = ministry.members.filter((m: any) => {
      const pId = m.parishioner ? m.parishioner.toString() : (m.member_id ? m.member_id.toString() : (m._id ? m._id.toString() : ''));
      return pId !== memberId && m._id?.toString() !== memberId;
    }) as any;

    await ministry.save();

    const updatedMinistry = await Organization.findById(id)
      .populate({ path: 'members.parishioner' })
      .populate({ path: 'members.member_id' });

    res.json(updatedMinistry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

