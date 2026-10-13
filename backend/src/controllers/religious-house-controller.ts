import { Request, Response } from 'express';
import { ReligiousHouse } from '../models';

const SAMPLE_RESIDENTS: Record<string, any[]> = {
  Convent: [
    { name: 'Sr. Little Rose CMC', designation: 'Mother Superior', phone: '+91 94470 71001', email: 'superior.carmel@devagiri.org' },
    { name: 'Sr. Mary Joseph CMC', designation: 'Vice Superior', phone: '+91 94470 71005', email: 'mary.j@devagiri.org' },
    { name: 'Sr. Anitha Thomas CMC', designation: 'School Principal', phone: '+91 94470 71008', email: 'anitha.t@devagiri.org' },
    { name: 'Sr. Teresa Mundackal CMC', designation: 'Counselor', phone: '+91 94470 44051', email: 'teresa.m@devagiri.org' },
    { name: 'Sr. Grace Maria CMC', designation: 'Health Administrator', phone: '+91 94470 71012', email: 'grace.m@devagiri.org' },
  ],
  Monastery: [
    { name: 'Fr. Bonaventure OFM', designation: 'Guardian / Superior', phone: '+91 94470 71002', email: 'bonaventure@devagiri.org' },
    { name: 'Fr. George Varghese OFM', designation: 'Vicar / Assistant', phone: '+91 94470 71006', email: 'george.v@devagiri.org' },
    { name: 'Fr. Mathew Kalapurackal OFM', designation: 'Formator', phone: '+91 94470 71009', email: 'mathew.k@devagiri.org' },
    { name: 'Br. Antony Puthur OFM', designation: 'Sacristan', phone: '+91 94470 71014', email: 'antony.p@devagiri.org' },
  ],
  'Formation House': [
    { name: 'Sr. Christy SABS', designation: 'Directress of Formees', phone: '+91 94470 71003', email: 'christy.sabs@devagiri.org' },
    { name: 'Sr. Rosamma Edathil SABS', designation: 'Assistant Directress', phone: '+91 94470 66309', email: 'rosamma.e@devagiri.org' },
    { name: 'Sr. Anna Kizhakkel SABS', designation: 'Spiritual Guide', phone: '+91 94470 88402', email: 'anna.k@devagiri.org' },
    { name: 'Sr. Philomena SABS', designation: 'Administrator', phone: '+91 94470 71017', email: 'philomena@devagiri.org' },
    { name: 'Sr. Alphonsa SABS', designation: 'Novice Sister', phone: '+91 94470 71018', email: 'alphonsa@devagiri.org' },
    { name: 'Sr. Rita Maria SABS', designation: 'Novice Sister', phone: '+91 94470 71019', email: 'rita@devagiri.org' },
  ],
};

/**
 * GET /api/directory/religious-houses or /api/admin/religious-houses
 * Returns all religious houses in database.
 */
export const getAllReligiousHouses = async (req: Request, res: Response): Promise<any> => {
  try {
    const list = await ReligiousHouse.find().sort({ name: 1 });
    const mapped = list.map((item: any) => {
      const obj = item.toObject ? item.toObject() : item;
      const typeKey = obj.category || obj.category_type || 'Convent';
      const defaultList = SAMPLE_RESIDENTS[typeKey] || SAMPLE_RESIDENTS['Convent'];
      return {
        ...obj,
        id: obj._id ? obj._id.toString() : obj.id,
        residents: (obj.residents && obj.residents.length > 0) ? obj.residents : defaultList,
      };
    });
    res.status(200).json(mapped);
  } catch (error: any) {
    console.error('Error fetching religious houses:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * POST /api/admin/religious-houses
 * Creates a new religious house.
 */
export const createReligiousHouse = async (req: Request, res: Response): Promise<any> => {
  const { name, category, category_type, superiorInCharge, superior_in_charge, residentCount, resident_count, contactNumber, contact_number, email, address, photoUrl, photo_url } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const cat = category || category_type || 'Convent';
  const sup = superiorInCharge || superior_in_charge || '';
  const count = Number(residentCount || resident_count || 0);
  const phone = contactNumber || contact_number || '';
  const photo = photoUrl || photo_url || '';

  try {
    const house = await ReligiousHouse.create({
      name: name.trim(),
      category: cat.trim(),
      category_type: cat.trim(),
      superior_in_charge: sup.trim(),
      resident_count: count,
      contact_number: phone.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      photo_url: photo,
    });
    res.status(201).json(house);
  } catch (error: any) {
    console.error('Error creating religious house:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * PUT /api/admin/religious-houses/:id
 * Updates an existing religious house.
 */
export const updateReligiousHouse = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name, category, category_type, superiorInCharge, superior_in_charge, residentCount, resident_count, contactNumber, contact_number, email, address, photoUrl, photo_url } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const cat = category || category_type || 'Convent';
  const sup = superiorInCharge || superior_in_charge || '';
  const count = Number(residentCount || resident_count || 0);
  const phone = contactNumber || contact_number || '';
  const photo = photoUrl || photo_url || '';

  try {
    const updated = await ReligiousHouse.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        category: cat.trim(),
        category_type: cat.trim(),
        superior_in_charge: sup.trim(),
        resident_count: count,
        contact_number: phone.trim(),
        email: email ? email.trim() : '',
        address: address ? address.trim() : '',
        photo_url: photo,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Religious house not found.' });
    }

    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error updating religious house:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/admin/religious-houses/:id
 * Deletes a religious house.
 */
export const deleteReligiousHouse = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    const deleted = await ReligiousHouse.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Religious house not found.' });
    }
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting religious house:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * POST /api/religious-houses/:id/residents
 * Pushes a new resident to the residents array and updates resident_count.
 */
export const addResidentToHouse = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { fullName, name, religiousName, designation, phone, email, dob, feastDay, photo, gender } = req.body;

  const residentName = fullName || name || religiousName;
  if (!residentName) {
    return res.status(400).json({ error: 'fullName is required.' });
  }

  try {
    const house = await ReligiousHouse.findById(id);
    if (!house) {
      return res.status(404).json({ error: 'Religious house not found.' });
    }

    if (!Array.isArray(house.residents)) {
      house.residents = [];
    }

    const newResident: any = {
      fullName: residentName.trim(),
      religiousName: (religiousName || residentName).trim(),
      designation: (designation || 'Member').trim(),
      phone: (phone || '').trim(),
      email: (email || '').trim(),
      dob: dob ? new Date(dob) : undefined,
      feastDay: (feastDay || '').trim(),
      photo: photo || null,
      gender: gender || 'F',
    };

    house.residents.push(newResident);
    house.resident_count = house.residents.length;

    await house.save();
    const updatedObj = house.toObject ? house.toObject() : house;
    res.status(200).json(updatedObj);
  } catch (error: any) {
    console.error('Error adding resident to religious house:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/religious-houses/:id/residents/:residentId
 * Removes a resident from the residents array and updates resident_count.
 */
export const removeResidentFromHouse = async (req: Request, res: Response): Promise<any> => {
  const { id, residentId } = req.params;

  try {
    const house = await ReligiousHouse.findById(id);
    if (!house) {
      return res.status(404).json({ error: 'Religious house not found.' });
    }

    if (Array.isArray(house.residents)) {
      house.residents = house.residents.filter((r: any) => {
        const rId = String(r._id || r.id || r.fullName || r.name);
        return rId !== String(residentId);
      });
      house.resident_count = house.residents.length;
      await house.save();
    }

    const updatedObj = house.toObject ? house.toObject() : house;
    res.status(200).json(updatedObj);
  } catch (error: any) {
    console.error('Error removing resident from religious house:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

