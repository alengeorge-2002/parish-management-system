import { Request, Response, NextFunction } from 'express';
import { Parishioner, Family } from '../models';

/**
 * Safely escapes special regex characters in user search inputs.
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Searches the parish directory executing joins across parishioners, families, and wards.
 * Filters by search string (matching first_name, last_name, blood_group, or house_name),
 * or specific firstName, lastName, phone, wardId params.
 */
export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, wardId, search: searchQuery } = req.query;

    const rawSearch = (searchQuery as string || '').trim();

    let parishioners;

    if (rawSearch) {
      const escaped = escapeRegex(rawSearch);
      const searchRegex = new RegExp(escaped, 'i');

      // Find families whose house_name matches the escaped search regex
      const matchingFamilies = await Family.find({ house_name: searchRegex }).select('_id');
      const familyIds = matchingFamilies.map(f => f._id);

      parishioners = await Parishioner.find({
        $or: [
          { first_name: searchRegex },
          { last_name: searchRegex },
          { blood_group: searchRegex },
          { family: { $in: familyIds } },
          { family_id: { $in: familyIds } },
        ],
      })
        .populate({
          path: 'family',
          populate: [
            { path: 'ward' },
            { path: 'ward_id' },
          ],
        })
        .sort({ last_name: 1, first_name: 1 });
    } else {
      const filters: any[] = [];

      if (firstName && typeof firstName === 'string' && firstName.trim() !== '') {
        filters.push({ first_name: { $regex: escapeRegex(firstName.trim()), $options: 'i' } });
      }

      if (lastName && typeof lastName === 'string' && lastName.trim() !== '') {
        filters.push({ last_name: { $regex: escapeRegex(lastName.trim()), $options: 'i' } });
      }

      if (phone && typeof phone === 'string' && phone.trim() !== '') {
        const phoneRegex = new RegExp(escapeRegex(phone.trim()), 'i');
        const matchingPhoneFams = await Family.find({ contact_number: phoneRegex }).select('_id');
        const phoneFamIds = matchingPhoneFams.map(f => f._id);
        filters.push({
          $or: [
            { phone_number: phoneRegex },
            { family: { $in: phoneFamIds } },
            { family_id: { $in: phoneFamIds } },
          ],
        });
      }

      if (wardId) {
        const matchingWardFams = await Family.find({
          $or: [{ ward: wardId }, { ward_id: wardId }],
        }).select('_id');
        const wardFamIds = matchingWardFams.map(f => f._id);
        filters.push({
          $or: [
            { family: { $in: wardFamIds } },
            { family_id: { $in: wardFamIds } },
          ],
        });
      }

      const filterQuery = filters.length > 0 ? { $and: filters } : {};

      parishioners = await Parishioner.find(filterQuery)
        .populate({
          path: 'family',
          populate: [
            { path: 'ward' },
            { path: 'ward_id' },
          ],
        })
        .sort({ last_name: 1, first_name: 1 });
    }

    const results = parishioners.map((p: any) => {
      const pObj = p.toObject ? p.toObject() : p;
      const fam = pObj.family || pObj.family_id || {};
      const ward = fam?.ward || fam?.ward_id || {};

      return {
        member_id: pObj._id ? pObj._id.toString() : pObj.id,
        first_name: pObj.first_name,
        last_name: pObj.last_name,
        member_phone: pObj.phone_number,
        member_email: pObj.email,
        relationship_role: pObj.relationship_role || pObj.relation_to_head,
        is_head_of_household: pObj.is_head_of_household,
        dob: pObj.dob,
        dom: pObj.dom,
        occupation: pObj.occupation,
        blood_group: pObj.blood_group,
        family_id: fam?._id ? fam._id.toString() : (fam?.id || null),
        family_name: fam?.family_name || fam?.house_name || '',
        head_of_family: fam?.head_of_family || null,
        house_name: fam?.house_name || '',
        home_address: fam?.home_address || fam?.address || '',
        family_photo_url: fam?.family_photo_url || null,
        family_phone: fam?.contact_number || null,
        reg_no: fam?.reg_no || null,
        family_email: fam?.email || null,
        unit_number: fam?.unit_number || '',
        ward_id: ward?._id ? ward._id.toString() : (ward?.id || null),
        ward_name: ward?.ward_name || '',
      };
    });

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Directory search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
