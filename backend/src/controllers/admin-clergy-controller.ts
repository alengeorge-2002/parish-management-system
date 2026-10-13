import { Request, Response } from 'express';
import { Clergy } from '../models';

/**
 * POST /api/admin/clergy
 * Creates a new clergy directory record.
 */
export const createClergy = async (req: Request, res: Response): Promise<any> => {
  const { name, role_type, role, title, designation, address, bio, email, phone_number, phone, blood_group, house_id } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const roleType = role_type || role || title || 'Vicar';
  const desig = designation || title || roleType;
  const addr = address || bio || null;
  const ph = phone_number || phone || null;

  let avatar_url: string | null = null;
  if (req.file) {
    avatar_url = `/uploads/clergy-avatars/${req.file.filename}`;
  } else if (req.body.avatarUrl) {
    avatar_url = req.body.avatarUrl;
  } else if (req.body.avatar_url) {
    avatar_url = req.body.avatar_url;
  }

  const parsedHouseId = house_id && house_id !== 'null' && house_id !== '' ? house_id : null;

  try {
    const clergy = await Clergy.create({
      name,
      role_type: roleType,
      role: roleType,
      designation: desig,
      address: addr,
      email: email || null,
      phone_number: ph,
      blood_group: blood_group || null,
      avatar_url: avatar_url,
      house_id: parsedHouseId,
    });

    res.status(201).json(clergy);
  } catch (error: any) {
    console.error('Error creating clergy:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * PUT /api/admin/clergy/:id
 * Updates an existing clergy directory record.
 */
export const updateClergy = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name, role_type, role, title, designation, address, bio, email, phone_number, phone, blood_group, house_id } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const roleType = role_type || role || title || 'Vicar';
  const desig = designation || title || roleType;
  const addr = address || bio || null;
  const ph = phone_number || phone || null;

  try {
    const existingClergy = await Clergy.findById(id);
    if (!existingClergy) {
      return res.status(404).json({ error: 'Clergy record not found.' });
    }

    let avatar_url = existingClergy.avatar_url || null;
    if (req.file) {
      avatar_url = `/uploads/clergy-avatars/${req.file.filename}`;
    } else if (req.body.avatarUrl) {
      avatar_url = req.body.avatarUrl;
    } else if (req.body.avatar_url) {
      avatar_url = req.body.avatar_url;
    }

    const parsedHouseId = house_id && house_id !== 'null' && house_id !== '' ? house_id : null;

    const updated = await Clergy.findByIdAndUpdate(
      id,
      {
        name,
        role_type: roleType,
        role: roleType,
        designation: desig,
        address: addr,
        email: email || null,
        phone_number: ph,
        blood_group: blood_group || null,
        avatar_url: avatar_url,
        house_id: parsedHouseId,
      },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error updating clergy:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/admin/clergy/:id
 * Deletes a clergy directory record.
 */
export const deleteClergy = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const deleted = await Clergy.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Clergy record not found.' });
    }
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting clergy:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
