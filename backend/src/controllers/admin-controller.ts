import { Request, Response, NextFunction } from 'express';
import { Ward, Family, Parishioner, AppUser } from '../models';

/*** User Management ***/
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await AppUser.find().populate('member_id');
    const mapped = users.map((u: any) => ({
      id: u._id.toString(),
      member_id: u.member_id?._id ? u.member_id._id.toString() : u.member_id,
      role: u.role,
      access_key: u.access_key,
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching users' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { memberId, role, accessKey } = req.body;
    if (!memberId || !role) {
      return res.status(400).json({ error: 'memberId and role required' });
    }
    const finalAccessKey = accessKey || Math.random().toString(36).slice(2, 14);
    const user = await AppUser.create({
      member_id: memberId,
      access_key: finalAccessKey,
      role: role,
    });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating user' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'role required' });
    }
    const user = await AppUser.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AppUser.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting user' });
  }
};

/*** Ward Management ***/
export const getAllWards = async (_req: Request, res: Response) => {
  try {
    const wards = await Ward.find();
    res.json(wards);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching wards' });
  }
};

export const createWard = async (req: Request, res: Response): Promise<any> => {
  try {
    const { wardName, ward_name, patron, wardNumber, ward_number, wardPrefix, ward_prefix, totalUnits, total_units, representativeName, representative_name, president, rep, contactPhone, contact_phone, phone } = req.body;
    const name = wardName || ward_name || patron;
    if (!name) return res.status(400).json({ error: 'wardName required' });
    
    const ward = await Ward.create({
      ward_name: name,
      ward_number: wardNumber || ward_number || 1,
      ward_prefix: wardPrefix || ward_prefix || 'W',
      total_units: totalUnits || total_units || 0,
      representative_name: representativeName || representative_name || president || rep || '',
      contact_phone: contactPhone || contact_phone || phone || '',
    });
    res.status(201).json(ward);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating ward' });
  }
};

export const updateWard = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { wardName, ward_name, patron, wardNumber, ward_number, wardPrefix, ward_prefix, totalUnits, total_units, representativeName, representative_name, president, rep, contactPhone, contact_phone, phone } = req.body;
    const name = wardName || ward_name || patron;
    if (!name) return res.status(400).json({ error: 'wardName required' });
    
    const ward = await Ward.findByIdAndUpdate(
      id,
      {
        ward_name: name,
        ward_number: wardNumber || ward_number || 1,
        ward_prefix: wardPrefix || ward_prefix || 'W',
        total_units: totalUnits || total_units || 0,
        representative_name: representativeName || representative_name || president || rep || '',
        contact_phone: contactPhone || contact_phone || phone || '',
      },
      { new: true }
    );
    if (!ward) return res.status(404).json({ error: 'Ward not found' });
    res.json(ward);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating ward' });
  }
};

export const deleteWard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Ward.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting ward' });
  }
};

export const addUnitToWard = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id);
    if (!ward) return res.status(404).json({ message: 'Ward not found' });
    const unitNumber = req.body.unitNumber || req.body.unit_number;
    const unitData = {
      unitNumber: unitNumber,
      unit_number: unitNumber,
      unitName: req.body.unitName || '',
      representativeName: req.body.representativeName || '',
      representativePhone: req.body.representativePhone || '',
    };
    if (!Array.isArray(ward.units)) {
      ward.units = [];
    }
    ward.units.push(unitData as any);
    ward.total_units = ward.units.length;
    await ward.save();
    return res.status(201).json(ward);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/*** Family Management ***/
export const getAllFamilies = async (_req: Request, res: Response) => {
  try {
    const families = await Family.find().populate('ward').populate('ward_id');
    res.json(families);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching families' });
  }
};

const extractUploadedPhoto = (req: Request): string | null => {
  if (req.file) {
    return `/uploads/family-photos/${req.file.filename}`;
  }
  const filesAny = req.files as any;
  if (filesAny) {
    if (filesAny.familyPhoto && filesAny.familyPhoto[0]) {
      return `/uploads/family-photos/${filesAny.familyPhoto[0].filename}`;
    }
    if (filesAny.family_photo && filesAny.family_photo[0]) {
      return `/uploads/family-photos/${filesAny.family_photo[0].filename}`;
    }
  }
  return null;
};

const sanitizeWardId = (inputWard: any): string | null => {
  if (!inputWard) return null;
  let raw = inputWard;
  if (typeof raw === 'object') {
    raw = raw._id || raw.id || raw.ward_id || raw.ward;
  } else if (typeof raw === 'string' && raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      raw = parsed._id || parsed.id || raw;
    } catch (_) {}
  }
  const strVal = String(raw).trim();
  if (!strVal || strVal === 'null' || strVal === 'undefined' || strVal === '[object Object]') {
    return null;
  }
  return strVal;
};

const resolveWardDetails = async (wardId: any) => {
  if (!wardId) return {};
  try {
    const w = await Ward.findById(wardId);
    if (w) {
      return {
        ward: w._id,
        ward_id: w._id,
        wardId: w._id,
        wardNumber: w.wardNumber || w.ward_number,
        ward_number: w.ward_number || w.wardNumber,
        wardName: w.wardName || w.ward_name,
        ward_name: w.ward_name || w.wardName,
      };
    }
  } catch (_) {}
  return {};
};

export const createFamily = async (req: Request, res: Response) => {
  try {
    const { houseName, house_name, familyName, family_name, familyCode, family_code, headOfFamily, head_of_family, wardId, ward, unit, unitNumber, unit_number, address, homeAddress, home_address, contactNumber, contact_number, regNo, reg_no, email, unitId, unit_id } = req.body;

    let familyPhotoUrl = extractUploadedPhoto(req);
    if (!familyPhotoUrl) {
      familyPhotoUrl = req.body.familyPhotoUrl || req.body.family_photo_url || req.body.family_photo || null;
    }

    const cleanWard = sanitizeWardId(wardId || ward);
    const wardMeta = await resolveWardDetails(cleanWard);
    const hName = houseName || house_name || familyName || family_name || '';
    const assignedUnit = unit || unit_number || unitNumber || 'Unit I';

    const family = await Family.create({
      house_name: hName,
      family_name: familyName || family_name || hName,
      family_code: familyCode || family_code || '',
      ward: cleanWard,
      ward_id: cleanWard,
      wardId: cleanWard,
      ...wardMeta,
      unit: assignedUnit,
      unit_number: assignedUnit,
      address: address || homeAddress || home_address || '',
      home_address: homeAddress || home_address || address || '',
      family_photo_url: familyPhotoUrl,
      head_of_family: headOfFamily || head_of_family || null,
      contact_number: contactNumber || contact_number || null,
      reg_no: regNo || reg_no || null,
      email: email || null,
      unit_id: unitId || unit_id || null,
    });

    res.status(201).json(family);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating family' });
  }
};

export const updateFamily = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { houseName, house_name, familyName, family_name, familyCode, family_code, headOfFamily, head_of_family, wardId, ward, unit, unitNumber, unit_number, address, homeAddress, home_address, contactNumber, contact_number, regNo, reg_no, email, unitId, unit_id } = req.body;

    const existingFam = await Family.findById(id);
    let familyPhotoUrl = extractUploadedPhoto(req);
    if (!familyPhotoUrl) {
      familyPhotoUrl = req.body.familyPhotoUrl || req.body.family_photo_url || req.body.family_photo || existingFam?.family_photo_url || null;
    }

    const cleanWard = sanitizeWardId(wardId || ward) || existingFam?.ward || existingFam?.ward_id || null;
    const wardMeta = await resolveWardDetails(cleanWard);
    const hName = houseName || house_name || familyName || family_name || existingFam?.house_name;
    const assignedUnit = unit || unit_number || unitNumber || existingFam?.unit || existingFam?.unit_number || 'Unit I';

    const updated = await Family.findByIdAndUpdate(
      id,
      {
        house_name: hName,
        family_name: familyName || family_name || hName,
        family_code: familyCode || family_code || existingFam?.family_code,
        ward: cleanWard,
        ward_id: cleanWard,
        wardId: cleanWard,
        ...wardMeta,
        unit: assignedUnit,
        unit_number: assignedUnit,
        address: address || homeAddress || home_address || existingFam?.address,
        home_address: homeAddress || home_address || address || existingFam?.home_address,
        family_photo_url: familyPhotoUrl,
        head_of_family: headOfFamily || head_of_family || existingFam?.head_of_family,
        contact_number: contactNumber || contact_number || existingFam?.contact_number,
        reg_no: regNo || reg_no || existingFam?.reg_no,
        email: email || existingFam?.email,
        unit_id: unitId || unit_id || existingFam?.unit_id,
      },
      { new: true }
    );

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating family' });
  }
};

export const getFamilyById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const family = await Family.findById(id).populate('ward').populate('ward_id');
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    const members = await Parishioner.find({
      $or: [
        { family_id: id },
        { familyId: id },
        { family_id: family._id },
      ],
    }).populate('ward_id').populate('family_id');
    res.json({ family, members });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching family details' });
  }
};

export const deleteFamily = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Family.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting family' });
  }
};

/*** Member / Parishioner Management ***/
const parseDate = (val: any) => {
  if (val === '-' || val === 'null' || val === '' || val === undefined || val === null) {
    return null;
  }
  return val;
};

export const getAllMembers = async (req: Request, res: Response) => {
  try {
    const { search, familyId, family_id } = req.query;
    const targetFamilyId = familyId || family_id;
    let queryFilter: any = {};

    if (targetFamilyId) {
      queryFilter.$or = [{ family_id: targetFamilyId }, { familyId: targetFamilyId }];
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchingFamilies = await Family.find({ house_name: searchRegex }).select('_id');
      const familyIds = matchingFamilies.map(f => f._id);

      const searchConditions = [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { baptism_name: searchRegex },
        { phone_number: searchRegex },
        { family_id: { $in: familyIds } },
      ];

      if (queryFilter.$or) {
        queryFilter = { $and: [{ $or: queryFilter.$or }, { $or: searchConditions }] };
      } else {
        queryFilter.$or = searchConditions;
      }
    }

    const parishioners = await Parishioner.find(queryFilter).populate('family_id').populate('ward_id');

    const mapped = parishioners.map((p: any) => {
      const pObj = p.toObject ? p.toObject() : p;
      const fam = pObj.family_id || pObj.family;
      return {
        ...pObj,
        id: pObj._id ? pObj._id.toString() : pObj.id,
        family_id: fam ? (fam._id ? fam._id.toString() : fam.toString()) : null,
        house_name: fam && typeof fam === 'object' ? fam.house_name : undefined,
      };
    });

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching members' });
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const {
      familyId, family_id, family,
      fullName, name, firstName, first_name, lastName, last_name,
      malayalamName, malayalam_name, nameMl,
      baptismName, baptism_name,
      gender,
      phoneNumber, phone_number, phone,
      email,
      relationshipToHead, relationshipRole, relationship_role, relation_to_head,
      isHeadOfHousehold, is_head_of_household,
      dob, dom,
      baptismDate, firstCommunionDate, confirmationDate, marriageDate,
      occupation, bloodGroup, blood_group,
      wardId, ward_id, ward, wardNumber, ward_number,
      unit, unitNumber, unit_number,
      status,
      sacraments
    } = req.body;
    
    const targetFamilyId = familyId || family_id || family || null;
    let cleanWard = wardId || ward_id || ward || null;
    let finalWardNumber = wardNumber || ward_number || 1;
    let assignedUnit = unit || unit_number || unitNumber || null;

    const nameStr = fullName || name || '';
    let fName = firstName || first_name || '';
    let lName = lastName || last_name || '';
    if (!fName && nameStr) {
      const parts = nameStr.trim().split(' ');
      fName = parts[0] || '';
      lName = parts.slice(1).join(' ') || '';
    }

    if (targetFamilyId) {
      const parentFamily = await Family.findById(targetFamilyId);
      if (parentFamily) {
        cleanWard = parentFamily.ward_id || parentFamily.wardId || parentFamily.ward || cleanWard;
        finalWardNumber = parentFamily.ward_number || parentFamily.wardNumber || finalWardNumber;
        assignedUnit = parentFamily.unit_number || parentFamily.unit || assignedUnit;
      }
    }

    const parishioner = await Parishioner.create({
      family: targetFamilyId,
      family_id: targetFamilyId,
      first_name: fName,
      last_name: lName,
      malayalam_name: malayalamName || malayalam_name || nameMl || '',
      baptism_name: baptismName || baptism_name || '',
      gender: gender || 'MALE',
      phone_number: phone || phoneNumber || phone_number || null,
      email: email || null,
      status: status || 'active',
      relationship_role: relationshipToHead || relationshipRole || relationship_role || relation_to_head || 'Member',
      relation_to_head: relation_to_head || relationshipToHead || relationshipRole || relationship_role || 'Member',
      is_head_of_household: isHeadOfHousehold !== undefined ? isHeadOfHousehold : (is_head_of_household || false),
      dob: parseDate(dob),
      dom: parseDate(dom || marriageDate),
      baptism_date: parseDate(baptismDate),
      first_communion_date: parseDate(firstCommunionDate),
      confirmation_date: parseDate(confirmationDate),
      marriage_date: parseDate(marriageDate || dom),
      ward_id: cleanWard,
      wardId: cleanWard,
      ward_number: finalWardNumber,
      wardNumber: finalWardNumber,
      unit: assignedUnit,
      unit_number: assignedUnit,
      sacraments: Array.isArray(sacraments) ? sacraments : [],
      occupation: occupation || null,
      blood_group: bloodGroup || blood_group || null,
    });

    res.status(201).json(parishioner);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating member' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      familyId, family_id, family,
      fullName, name, firstName, first_name, lastName, last_name,
      malayalamName, malayalam_name, nameMl,
      baptismName, baptism_name,
      gender,
      phoneNumber, phone_number, phone,
      email,
      relationshipToHead, relationshipRole, relationship_role, relation_to_head,
      isHeadOfHousehold, is_head_of_household,
      dob, dom,
      baptismDate, firstCommunionDate, confirmationDate, marriageDate,
      occupation, bloodGroup, blood_group,
      wardId, ward_id, ward, wardNumber, ward_number,
      unit, unitNumber, unit_number,
      status,
      sacraments
    } = req.body;
    
    const targetFamilyId = familyId || family_id || family;
    let cleanWard = wardId || ward_id || ward;
    let finalWardNumber = wardNumber || ward_number;
    let assignedUnit = unit || unit_number || unitNumber;

    const nameStr = fullName || name || '';
    let fName = firstName || first_name || '';
    let lName = lastName || last_name || '';
    if (!fName && nameStr) {
      const parts = nameStr.trim().split(' ');
      fName = parts[0] || '';
      lName = parts.slice(1).join(' ') || '';
    }

    if (targetFamilyId) {
      const parentFamily = await Family.findById(targetFamilyId);
      if (parentFamily) {
        cleanWard = parentFamily.ward_id || parentFamily.wardId || parentFamily.ward || cleanWard;
        finalWardNumber = parentFamily.ward_number || parentFamily.wardNumber || finalWardNumber;
        assignedUnit = parentFamily.unit_number || parentFamily.unit || assignedUnit;
      }
    }

    const updated = await Parishioner.findByIdAndUpdate(
      id,
      {
        ...(targetFamilyId && { family: targetFamilyId, family_id: targetFamilyId }),
        ...(fName && { first_name: fName }),
        ...(lName !== undefined && { last_name: lName }),
        ...(malayalamName || malayalam_name || nameMl ? { malayalam_name: malayalamName || malayalam_name || nameMl } : {}),
        ...(baptismName || baptism_name ? { baptism_name: baptismName || baptism_name } : {}),
        ...(gender && { gender }),
        ...(phone || phoneNumber || phone_number ? { phone_number: phone || phoneNumber || phone_number } : {}),
        ...(email !== undefined && { email }),
        ...(status && { status }),
        ...(relationshipToHead || relationshipRole || relationship_role || relation_to_head ? {
          relationship_role: relationshipToHead || relationshipRole || relationship_role || relation_to_head,
          relation_to_head: relation_to_head || relationshipToHead || relationshipRole || relationship_role,
        } : {}),
        ...(isHeadOfHousehold !== undefined ? { is_head_of_household: isHeadOfHousehold } : {}),
        ...(dob !== undefined && { dob: parseDate(dob) }),
        ...(dom !== undefined || marriageDate !== undefined ? { dom: parseDate(dom || marriageDate) } : {}),
        ...(baptismDate !== undefined && { baptism_date: parseDate(baptismDate) }),
        ...(firstCommunionDate !== undefined && { first_communion_date: parseDate(firstCommunionDate) }),
        ...(confirmationDate !== undefined && { confirmation_date: parseDate(confirmationDate) }),
        ...(marriageDate !== undefined && { marriage_date: parseDate(marriageDate) }),
        ...(cleanWard ? { ward_id: cleanWard, wardId: cleanWard } : {}),
        ...(finalWardNumber !== undefined ? { ward_number: finalWardNumber, wardNumber: finalWardNumber } : {}),
        ...(assignedUnit ? { unit: assignedUnit, unit_number: assignedUnit } : {}),
        ...(Array.isArray(sacraments) ? { sacraments } : {}),
        ...(occupation !== undefined && { occupation }),
        ...(bloodGroup || blood_group ? { blood_group: bloodGroup || blood_group } : {}),
      },
      { new: true }
    );

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating member' });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Parishioner.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting member' });
  }
};

export const importMembersBulk = async (req: Request, res: Response): Promise<any> => {
  try {
    const { members } = req.body;
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "No records supplied" });
    }

    const operations = await Promise.all(
      members.map(async (m: any) => {
        const rawName = m.fullName || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Parishioner';
        const nameParts = rawName.split(' ');
        const firstName = nameParts[0] || 'Parishioner';
        const lastName = nameParts.slice(1).join(' ') || '';

        const phone = m.phone || m.phone_number || m.phoneNumber || '';
        const blood = m.bloodGroup || m.blood_group || m.blood || 'O+';
        const houseName = m.houseName || m.familyHouse || m.house_name || m.familyName || 'Parish House';

        let familyObj = await Family.findOne({
          $or: [{ house_name: houseName }, { family_name: houseName }]
        });
        if (!familyObj) {
          familyObj = await Family.create({
            house_name: houseName,
            family_name: houseName,
            contact_number: phone,
          });
        }

        return {
          updateOne: {
            filter: {
              $or: [
                ...(phone ? [{ phone_number: phone }] : []),
                { first_name: firstName, last_name: lastName },
              ]
            },
            update: {
              $set: {
                first_name: firstName,
                last_name: lastName,
                malayalam_name: m.malayalamName || m.malayalam_name || m.nameMl || '',
                phone_number: phone,
                blood_group: blood,
                status: (m.status || 'active').toLowerCase(),
                family: familyObj._id,
                family_id: familyObj._id,
                unit: m.unit || m.unit_number || 'Unit I',
                unit_number: m.unit || m.unit_number || 'Unit I',
              }
            },
            upsert: true
          }
        };
      })
    );

    const result = await Parishioner.bulkWrite(operations);
    res.json({ message: "Successfully imported parishioners", result });
  } catch (err: any) {
    console.error('Error importing members bulk:', err);
    res.status(500).json({ error: err.message || 'Bulk import failed' });
  }
};

/*** Dashboard Overview ***/
export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [wardCount, familyCount, memberCount, userCount] = await Promise.all([
      Ward.countDocuments(),
      Family.countDocuments(),
      Parishioner.countDocuments(),
      AppUser.countDocuments(),
    ]);

    res.json({
      wards: wardCount,
      families: familyCount,
      members: memberCount,
      users: userCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching dashboard stats' });
  }
};
