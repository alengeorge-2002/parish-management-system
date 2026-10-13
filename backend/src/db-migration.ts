import { connectDB } from './config/db';
import { Ward, Unit, Family, Parishioner, AppUser } from './models';

export const runGeneralDbMigration = async () => {
  console.log('Starting MongoDB general schema migration & seeding...');
  try {
    await connectDB();

    // 1. Find existing Ward #1 or first ward
    let stJosephWard = await Ward.findOne({ ward_number: 1 }) || await Ward.findOne();
    if (!stJosephWard) {
      stJosephWard = await Ward.create({ ward_name: 'St. ALPHONSA WARD, DEVAGIRI', ward_number: 1, total_units: 4 });
    }

    // 2. Ensure Unit 5 exists
    let unit5 = await Unit.findOne({ unit_number: 5, ward_id: stJosephWard._id });
    if (!unit5) {
      unit5 = await Unit.create({ unit_number: 5, ward_id: stJosephWard._id });
    }

    // 3. Seed Ponnamattam Family
    let ponnamattamFamily = await Family.findOne({ house_name: 'Ponnamattam' });
    if (!ponnamattamFamily) {
      ponnamattamFamily = await Family.create({
        family_name: 'Ponnamattam Family',
        house_name: 'Ponnamattam',
        head_of_family: 'Benny',
        ward: stJosephWard._id,
        ward_id: stJosephWard._id,
        unit_number: '5',
        unit_id: unit5._id,
        home_address: 'E5-225, KSHB Colony, Medical College P.O., Kozhikode - 673008',
        address: 'E5-225, KSHB Colony, Medical College P.O., Kozhikode - 673008',
        family_photo_url: 'https://example.com/photos/ponnamattam.jpg',
        contact_number: '555-0101',
        reg_no: 'VI-65/33',
        email: 'bennyhilarious@gmail.com',
      });
    }

    // 4. Seed Ponnamattam Family Members
    const familyMembersSeed = [
      { first_name: 'Benny', last_name: 'Ponnamattam', phone_number: '555-0101', email: 'bennyhilarious@gmail.com', relationship_role: 'Husband', is_head_of_household: true, dob: '1975-05-12', dom: '2000-01-20', occupation: 'Engineer', blood_group: 'O+' },
      { first_name: 'Sophia', last_name: 'Ponnamattam', phone_number: '555-0102', email: 'sophia@example.com', relationship_role: 'Wife', is_head_of_household: false, dob: '1978-08-22', dom: '2000-01-20', occupation: 'Teacher', blood_group: 'O+' },
      { first_name: 'Shilpa', last_name: 'Ponnamattam', phone_number: '555-0103', email: 'shilpa@example.com', relationship_role: 'Daughter', is_head_of_household: false, dob: '2002-11-05', dom: null, occupation: 'Student', blood_group: 'O+' },
      { first_name: 'Richard', last_name: 'Ponnamattam', phone_number: '555-0104', email: 'richard@example.com', relationship_role: 'Son', is_head_of_household: false, dob: '2005-04-14', dom: null, occupation: 'Student', blood_group: 'O+' },
      { first_name: 'Sandra', last_name: 'Ponnamattam', phone_number: '555-0105', email: 'sandra@example.com', relationship_role: 'Daughter', is_head_of_household: false, dob: '2008-09-30', dom: null, occupation: 'Student', blood_group: 'O+' },
    ];

    let bennyDoc: any = null;
    for (const mem of familyMembersSeed) {
      let parishioner = await Parishioner.findOne({ first_name: mem.first_name, family: ponnamattamFamily._id });
      if (!parishioner) {
        parishioner = await Parishioner.create({
          ...mem,
          relation_to_head: mem.relationship_role,
          family: ponnamattamFamily._id,
          family_id: ponnamattamFamily._id,
        });
      }
      if (mem.first_name === 'Benny') {
        bennyDoc = parishioner;
      }
    }

    // 5. Seed AppUser permanent access key for Benny
    if (bennyDoc) {
      let bennyUser = await AppUser.findOne({ access_key: 'access_key_user_ponnamattam' });
      if (!bennyUser) {
        await AppUser.create({
          member_id: bennyDoc._id,
          access_key: 'access_key_user_ponnamattam',
          role: 'parishioner',
        });
      }

      // Seed Admin Access Keys
      const adminKeys = ['access_key_admin_123', 'ADMIN-123456', 'admin'];
      for (const key of adminKeys) {
        let adminUser = await AppUser.findOne({ access_key: key });
        if (!adminUser) {
          await AppUser.create({
            member_id: bennyDoc._id,
            access_key: key,
            role: 'admin',
          });
        } else if (adminUser.role !== 'admin') {
          adminUser.role = 'admin';
          await adminUser.save();
        }
      }
    }


    console.log('MongoDB General schema migration and seeding completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

export default runGeneralDbMigration;
