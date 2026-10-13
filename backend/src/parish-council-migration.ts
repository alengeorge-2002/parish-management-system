import { Ward, Family, Parishioner, ParishCouncil } from './models';

/**
 * Mongoose migration for parish_council collection.
 * Ensures initial wards exist, clergy staff family exists, and parish council seats are seeded.
 */
export const runParishCouncilMigration = async (): Promise<void> => {
  console.log('Starting parish council Mongoose migration...');
  try {
    const wardsToEnsure = [
      'St. Jude Ward',
      'St. Mary Ward',
      'St. Joseph Ward',
      'St. Sebastian Ward',
      'Lourdes Ward',
      'St. Thomas Ward',
    ];

    const wardMap: Record<string, any> = {};

    for (const wName of wardsToEnsure) {
      let ward = await Ward.findOne({ ward_name: new RegExp(wName.split(' ')[1] || wName, 'i') }) || await Ward.findOne();
      if (!ward) {
        ward = await Ward.create({ ward_name: wName, ward_number: 1, total_units: 5 });
      }
      wardMap[wName] = ward._id;
    }

    let staffFamily = await Family.findOne({ family_name: 'Parish Clergy & Staff' });
    if (!staffFamily) {
      staffFamily = await Family.create({
        family_name: 'Parish Clergy & Staff',
        house_name: 'Parish House',
        head_of_family: 'Vicar',
        ward: wardMap['St. Jude Ward'],
        ward_id: wardMap['St. Jude Ward'],
        unit_number: '101',
        home_address: 'Devagiri Church Compound, Calicut',
        address: 'Devagiri Church Compound, Calicut',
        contact_number: '+91 495 2701234',
        reg_no: 'REG-ADMIN',
        email: 'pp.stjosephdevagiri@gmail.com',
      });
    }

    const insertOrGetMember = async (firstName: string, lastName: string, phone: string, email: string, relationship: string) => {
      let member = await Parishioner.findOne({ first_name: firstName, last_name: lastName });
      if (!member) {
        member = await Parishioner.create({
          family: staffFamily!._id,
          family_id: staffFamily!._id,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          email: email,
          relationship_role: relationship,
          relation_to_head: relationship,
          is_head_of_household: false,
        });
      }
      return member._id;
    };

    const vicarId = await insertOrGetMember('Rev. Fr. Joseph', 'Mathew', '+919845000001', 'pp.stjosephdevagiri@gmail.com', 'President');
    const asstVicarId = await insertOrGetMember('Rev. Fr. George', 'Varghese', '+919845000002', 'assoc.stjosephdevagiri@gmail.com', 'Vice President');
    const anithaId = await insertOrGetMember('Sr. Anitha', 'Thomas', '+919845000003', 'anitha.thomas@gmail.com', 'Sister Representative');
    const maryJosephId = await insertOrGetMember('Sr. Mary', 'Joseph', '+919845000004', 'mary.joseph@gmail.com', 'Sister Representative');
    const profJosephId = await insertOrGetMember('Prof. Joseph K.', 'A.', '+919845000005', 'joseph.ka@gmail.com', 'Trustee');
    const drThomasId = await insertOrGetMember('Dr. Thomas', 'Joseph', '+919845000006', 'thomas.joseph@gmail.com', 'Trustee');
    const advMaryId = await insertOrGetMember('Adv. Mary', 'Antony', '+919845000007', 'mary.antony@gmail.com', 'Secretary');

    const antonyId = await insertOrGetMember('Antony', 'Kurian', '+919845000008', 'antony.kurian@gmail.com', 'Ward Representative');
    const babyId = await insertOrGetMember('Baby', 'Joseph', '+919845000009', 'baby.joseph@gmail.com', 'Ward Representative');
    const sunnyId = await insertOrGetMember('Sunny', 'Sebastian', '+919845000010', 'sunny.sebastian@gmail.com', 'Ward Representative');
    const miniId = await insertOrGetMember('Mini', 'Mathew', '+919845000011', 'mini.mathew@gmail.com', 'Ward Representative');
    const georgeId = await insertOrGetMember('George', 'Mathew', '+919845000012', 'george.mathew@gmail.com', 'Ward Representative');

    const checkCouncilCount = await ParishCouncil.countDocuments();
    if (checkCouncilCount === 0) {
      const execSeats = [
        { member_id: vicarId, role_title: 'Vicar', committee_type: 'executive', ward_id: null, display_order: 1 },
        { member_id: asstVicarId, role_title: 'Assistant Vicar', committee_type: 'executive', ward_id: null, display_order: 2 },
        { member_id: anithaId, role_title: 'School Principal', committee_type: 'executive', ward_id: null, display_order: 3 },
        { member_id: maryJosephId, role_title: 'Social Service Wing', committee_type: 'executive', ward_id: null, display_order: 4 },
        { member_id: profJosephId, role_title: 'Trustee', committee_type: 'executive', ward_id: null, display_order: 5 },
        { member_id: drThomasId, role_title: 'Trustee', committee_type: 'executive', ward_id: null, display_order: 6 },
        { member_id: advMaryId, role_title: 'Parish Secretary', committee_type: 'executive', ward_id: null, display_order: 7 },
      ];

      const repSeats = [
        { member_id: antonyId, role_title: 'St. Mary Councilor', committee_type: 'representatives', ward_id: wardMap['St. Mary Ward'] || null, display_order: 1 },
        { member_id: babyId, role_title: 'St. Sebastian Councilor', committee_type: 'representatives', ward_id: wardMap['St. Sebastian Ward'] || null, display_order: 2 },
        { member_id: sunnyId, role_title: 'St. Joseph Councilor', committee_type: 'representatives', ward_id: wardMap['St. Joseph Ward'] || null, display_order: 3 },
        { member_id: miniId, role_title: 'Lourdes Councilor', committee_type: 'representatives', ward_id: wardMap['Lourdes Ward'] || null, display_order: 4 },
        { member_id: georgeId, role_title: 'St. Thomas Councilor', committee_type: 'representatives', ward_id: wardMap['St. Thomas Ward'] || null, display_order: 5 },
      ];

      for (const seat of [...execSeats, ...repSeats]) {
        await ParishCouncil.create(seat);
      }
      console.log('Seeded parish council members successfully in MongoDB.');
    }
  } catch (error) {
    console.error('Error running parish council migration:', error);
  }
};
