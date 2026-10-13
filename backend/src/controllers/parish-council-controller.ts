import { Request, Response, NextFunction } from 'express';
import { ParishCouncil, Parishioner, Ward } from '../models';

/**
 * GET /api/admin/parish-council
 * Retrieves all parish council seats for admin panel.
 */
export const getAllSeatsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const seats = await ParishCouncil.find()
      .populate('member_id')
      .populate('ward_id')
      .sort({ committee_type: 1, display_order: 1 });

    const mapped = seats.map((seat: any) => {
      const sObj = seat.toObject ? seat.toObject() : seat;
      const mem = sObj.member_id || {};
      const ward = sObj.ward_id || {};

      return {
        id: sObj._id ? sObj._id.toString() : sObj.id,
        member_id: mem._id ? mem._id.toString() : (mem.id || sObj.member_id),
        role_title: sObj.role_title,
        committee_type: sObj.committee_type,
        ward_id: ward._id ? ward._id.toString() : (ward.id || sObj.ward_id || null),
        display_order: sObj.display_order || 0,
        first_name: mem.first_name || '',
        last_name: mem.last_name || '',
        ward_name: ward.ward_name || '',
      };
    });

    res.status(200).json(mapped);
  } catch (error: any) {
    console.error('Error fetching admin seats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch seats.' });
  }
};

/**
 * POST /api/admin/parish-council
 * Creates a new parish council seat.
 */
export const createSeat = async (req: Request, res: Response): Promise<void> => {
  const {
    roleTitle,
    englishTitle,
    role_title,
    malayalamTitle,
    seatMl,
    category,
    committee_type,
    wardNumber,
    ward,
    ward_id,
    term,
    member_id,
    memberId,
    occupantName,
    phone,
    display_order
  } = req.body;

  const finalTitle = roleTitle || englishTitle || role_title;
  if (!finalTitle) {
    res.status(400).json({ error: 'roleTitle is required.' });
    return;
  }

  const finalCategory = category || committee_type || 'Ward Councillor';
  const finalWardNumber = wardNumber !== undefined ? (wardNumber ? parseInt(String(wardNumber), 10) : null) : (ward !== undefined ? (ward ? parseInt(String(ward), 10) : null) : null);

  try {
    const count = await ParishCouncil.countDocuments();
    const newSeat = await ParishCouncil.create({
      role_title: finalTitle,
      roleTitle: finalTitle,
      malayalamTitle: malayalamTitle || seatMl || '',
      category: finalCategory,
      committee_type: finalCategory,
      wardNumber: finalWardNumber,
      ward_id: ward_id && ward_id !== 'null' && ward_id !== '' ? ward_id : null,
      member_id: member_id || memberId || null,
      occupantName: occupantName || null,
      phone: phone || null,
      term: term || '2024 – 2026',
      status: (member_id || memberId || occupantName) ? 'filled' : 'vacant',
      display_order: display_order ? parseInt(String(display_order), 10) : count + 1,
    });

    const seats = await ParishCouncil.find().populate('member_id').populate('ward_id').sort({ display_order: 1 });
    res.status(201).json(seats);
  } catch (error: any) {
    console.error('Error creating seat:', error);
    res.status(500).json({ error: error.message || 'Failed to create seat.' });
  }
};


/**
 * PUT /api/parish-council/seats/:id/assign
 * Assigns a parishioner to a seat
 */
export const assignSeat = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { memberId, member_id, term, occupantName, phone } = req.body;
  const targetMemberId = memberId || member_id;

  try {
    let seat = await ParishCouncil.findById(id);
    if (!seat) {
      seat = await ParishCouncil.findOne({ role_title: { $regex: id, $options: 'i' } } as any);
    }

    let pName = occupantName || null;
    let pPhone = phone || null;
    let pWard = null;

    if (targetMemberId) {
      const member = await Parishioner.findById(targetMemberId);
      if (member) {
        const m = member as any;
        pName = m.fullName || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.name;
        pPhone = m.phone_number || m.phone;
        pWard = m.ward_number || m.wardNumber || m.ward;
      }
    }

    if (!seat) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }

    seat.member_id = targetMemberId || seat.member_id;
    seat.occupantName = pName || seat.occupantName;
    seat.phone = pPhone || seat.phone;
    if (pWard) seat.wardNumber = pWard;
    seat.status = 'filled';
    if (term) seat.term = term;

    await seat.save();

    res.status(200).json(seat);
  } catch (error: any) {
    console.error('Error assigning seat:', error);
    res.status(500).json({ error: error.message || 'Failed to assign seat.' });
  }
};

/**
 * PUT /api/parish-council/seats/:id/vacate
 * Vacates a seat
 */
export const vacateSeat = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const seat = await ParishCouncil.findById(id);
    if (!seat) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }

    seat.member_id = null;
    seat.occupantName = null;
    seat.phone = null;
    seat.status = 'vacant';

    await seat.save();

    res.status(200).json(seat);
  } catch (error: any) {
    console.error('Error vacating seat:', error);
    res.status(500).json({ error: error.message || 'Failed to vacate seat.' });
  }
};

/**
 * PUT /api/admin/parish-council/:id or /api/parish-council/seats/:id
 * Updates an existing parish council seat.
 */
export const updateSeat = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { member_id, memberId, role_title, roleTitle, committee_type, category, ward_id, wardNumber, term, occupantName, phone, status } = req.body;
  try {
    const targetMemberId = member_id || memberId;
    let pName = occupantName;
    let pPhone = phone;

    if (targetMemberId && !pName) {
      const member = await Parishioner.findById(targetMemberId);
      if (member) {
        const m = member as any;
        pName = m.fullName || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.name;
        pPhone = m.phone_number || m.phone;
      }
    }

    const updated = await ParishCouncil.findByIdAndUpdate(
      id,
      {
        ...(targetMemberId !== undefined && { member_id: targetMemberId }),
        ...(role_title || roleTitle ? { role_title: role_title || roleTitle, roleTitle: role_title || roleTitle } : {}),
        ...(committee_type || category ? { committee_type: committee_type || category, category: committee_type || category } : {}),
        ...(ward_id !== undefined && { ward_id: ward_id && ward_id !== 'null' && ward_id !== '' ? ward_id : null }),
        ...(wardNumber !== undefined && { wardNumber }),
        ...(term !== undefined && { term }),
        ...(pName !== undefined && { occupantName: pName }),
        ...(pPhone !== undefined && { phone: pPhone }),
        ...(status !== undefined && { status }),
      },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ error: 'Seat not found.' });
      return;
    }
    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error updating seat:', error);
    res.status(500).json({ error: error.message || 'Failed to update seat.' });
  }
};


/**
 * DELETE /api/admin/parish-council/:id
 * Deletes a parish council seat.
 */
export const deleteSeat = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deleted = await ParishCouncil.findByIdAndDelete(id);
    if (!deleted) {
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
 * Public directory search for Vicar, Assistant Vicar, and Parish Secretary.
 */
export const getQuickContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const seats = await ParishCouncil.find({
      role_title: { $in: ['Vicar', 'Assistant Vicar', 'Parish Secretary'] },
    }).populate('member_id').sort({ display_order: 1 });

    const contacts = seats.map((seat: any) => {
      const mem = seat.member_id || {};
      return {
        role_title: seat.role_title,
        name: `${mem.first_name || ''} ${mem.last_name || ''}`.trim(),
        phone_number: mem.phone_number || null,
        email: mem.email || null,
      };
    });

    const roles = ['Vicar', 'Assistant Vicar', 'Parish Secretary'];
    const finalContacts = roles.map(role => {
      const found = contacts.find(c => c.role_title === role);
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
 * Public directory listing of all seats.
 */
export const getParishCouncilDirectory = async (req: Request, res: Response): Promise<void> => {
  try {
    const seats = await ParishCouncil.find()
      .populate('member_id')
      .populate('ward_id')
      .sort({ committee_type: 1, display_order: 1 });

    const mapped = seats.map((seat: any) => {
      const sObj = seat.toObject ? seat.toObject() : seat;
      const mem = sObj.member_id || {};
      const ward = sObj.ward_id || {};

      return {
        id: sObj._id ? sObj._id.toString() : sObj.id,
        role_title: sObj.role_title,
        committee_type: sObj.committee_type,
        ward_id: ward._id ? ward._id.toString() : (ward.id || sObj.ward_id || null),
        display_order: sObj.display_order || 0,
        member_id: mem._id ? mem._id.toString() : (mem.id || sObj.member_id),
        first_name: mem.first_name || '',
        last_name: mem.last_name || '',
        phone_number: mem.phone_number || null,
        email: mem.email || null,
        ward_name: ward.ward_name || '',
      };
    });

    res.status(200).json(mapped);
  } catch (error: any) {
    console.error('Error fetching parish council directory:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch directory.' });
  }
};
