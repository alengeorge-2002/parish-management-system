require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devagiri_parish_db';

// Define Mongoose Schemas for seeding script
const WardSchema = new mongoose.Schema({
  ward_name: { type: String, required: true },
  ward_number: { type: Number, required: true },
  ward_prefix: { type: String, required: true },
  total_units: { type: Number, default: 0 },
  representative_name: { type: String, default: '' },
  contact_phone: { type: String, default: '' },
}, { timestamps: true });

const FamilySchema = new mongoose.Schema({
  house_name: { type: String, required: true },
  family_code: { type: String, default: '' },
  ward: { type: mongoose.Schema.Types.Mixed, ref: 'Ward', required: true },
  ward_id: { type: mongoose.Schema.Types.Mixed, ref: 'Ward' },
  unit_number: { type: String, required: true },
  address: { type: String, default: '' },
  home_address: { type: String, default: '' },
  family_photo_url: { type: String, default: null },
  family_name: { type: String, default: '' },
  head_of_family: { type: mongoose.Schema.Types.Mixed, default: null },
  contact_number: { type: String, default: null },
  reg_no: { type: String, default: null },
  email: { type: String, default: null },
}, { timestamps: true });

const ParishionerSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, default: '' },
  malayalam_name: { type: String, default: '' },
  baptism_name: { type: String, default: '' },
  gender: { type: String, default: 'MALE' },
  dob: { type: mongoose.Schema.Types.Mixed, default: null },
  relation_to_head: { type: String, default: '' },
  relationship_role: { type: String, default: '' },
  blood_group: { type: String, default: null },
  occupation: { type: String, default: null },
  phone_number: { type: String, default: null },
  email: { type: String, default: null },
  status: { type: String, default: 'active' },
  is_active: { type: Boolean, default: true },
  is_head_of_household: { type: Boolean, default: false },
  ward_id: { type: mongoose.Schema.Types.Mixed, default: null },
  sacraments: { type: [String], default: [] },
  family: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: false, default: null },
  family_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', default: null },
}, { timestamps: true });

const ClergySchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  role_type: { type: String, default: '' },
  category: { type: String, default: '' },
  designation: { type: String, default: null },
  phone_number: { type: String, default: null },
  email: { type: String, default: null },
  avatar_url: { type: String, default: null },
  display_order: { type: Number, default: 0 },
  is_quick_contact: { type: Boolean, default: false },
  address: { type: String, default: null },
  blood_group: { type: String, default: null },
  house_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ReligiousHouse', default: null },
}, { timestamps: true });

const ReligiousHouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category_type: { type: String, default: 'Convent' },
  category: { type: String, default: 'Convent' },
  superior_in_charge: { type: String, default: '' },
  resident_count: { type: Number, default: 0 },
  contact_number: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  photo_url: { type: String, default: '' },
  residents: [{
    name: { type: String, required: true },
    designation: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    photo: { type: String, default: '' },
  }],
}, { timestamps: true });

const OrganizationSchema = new mongoose.Schema({
  name_en: { type: String, required: true },
  name_ml: { type: String, default: '' },
  title: { type: String, default: '' },
  category: { type: String, default: '' },
  description: { type: String, default: '' },
  icon_symbol: { type: String, default: '' },
  members: [{
    parishioner: { type: mongoose.Schema.Types.ObjectId, ref: 'Parishioner' },
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Parishioner' },
    role: { type: String, default: '' },
    role_title: { type: String, default: '' },
    display_order: { type: Number, default: 0 },
  }],
}, { timestamps: true });

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  poster_url: { type: String, default: null },
  image_url: { type: String, default: null },
  expiry_date: { type: mongoose.Schema.Types.Mixed, default: null },
  priority: { type: String, default: 'medium' },
  is_active: { type: Boolean, default: true },
  announcement_date: { type: Date, default: Date.now },
}, { timestamps: true });

const MassScheduleSchema = new mongoose.Schema({
  day_type: { type: String, required: true },
  time_slot: { type: String, required: true },
  description_en: { type: String, default: '' },
  description_ml: { type: String, default: '' },
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
  target_date: { type: mongoose.Schema.Types.Mixed, required: true },
  title_en: { type: String, required: true },
  title_ml: { type: String, default: '' },
  description_en: { type: String, default: '' },
  description_ml: { type: String, default: '' },
  title: { type: String, default: '' },
  event_date: { type: mongoose.Schema.Types.Mixed, default: null },
  mass_time: { type: String, default: '' },
  type_badge: { type: String, default: '' },
  location: { type: String, default: 'Main Sanctuary' },
  description: { type: String, default: '' },
}, { timestamps: true });

const ParishCouncilSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Parishioner', required: true },
  role_title: { type: String, required: true },
  committee_type: { type: String, required: true },
  ward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', default: null },
  display_order: { type: Number, default: 0 },
}, { timestamps: true });

// Models
const Ward = mongoose.models.Ward || mongoose.model('Ward', WardSchema);
const Family = mongoose.models.Family || mongoose.model('Family', FamilySchema);
const Parishioner = mongoose.models.Parishioner || mongoose.model('Parishioner', ParishionerSchema);
const Clergy = mongoose.models.Clergy || mongoose.model('Clergy', ClergySchema);
const ReligiousHouse = mongoose.models.ReligiousHouse || mongoose.model('ReligiousHouse', ReligiousHouseSchema);
const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
const MassSchedule = mongoose.models.MassSchedule || mongoose.model('MassSchedule', MassScheduleSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const ParishCouncil = mongoose.models.ParishCouncil || mongoose.model('ParishCouncil', ParishCouncilSchema);

async function seedDatabase() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB Connected successfully!');

  console.log('Clearing existing collections for clean seed...');
  await Promise.all([
    Ward.deleteMany({}),
    Family.deleteMany({}),
    Parishioner.deleteMany({}),
    Clergy.deleteMany({}),
    ReligiousHouse.deleteMany({}),
    Organization.deleteMany({}),
    Announcement.deleteMany({}),
    MassSchedule.deleteMany({}),
    Event.deleteMany({}),
    ParishCouncil.deleteMany({}),
  ]);
  console.log('Existing collections cleared.');

  // ==========================================
  // STEP A: Wards (Subdivisions 1 through 4)
  // ==========================================
  console.log('Seeding Step A: Wards 1 to 4...');
  const ward1 = await Ward.create({
    ward_name: 'St. Thomas Ward (Ward 1)',
    ward_number: 1,
    ward_prefix: 'W1',
    total_units: 5,
    representative_name: 'Mathai Joseph',
    contact_phone: '+91 98470 11001',
  });

  const ward2 = await Ward.create({
    ward_name: 'St. Joseph Ward (Ward 2)',
    ward_number: 2,
    ward_prefix: 'W2',
    total_units: 4,
    representative_name: 'Varghese Cherian',
    contact_phone: '+91 98470 11002',
  });

  const ward3 = await Ward.create({
    ward_name: 'St. Mary Ward (Ward 3)',
    ward_number: 3,
    ward_prefix: 'W3',
    total_units: 6,
    representative_name: 'Thomas Kurian',
    contact_phone: '+91 98470 11003',
  });

  const ward4 = await Ward.create({
    ward_name: 'St. Jude Ward (Ward 4)',
    ward_number: 4,
    ward_prefix: 'W4',
    total_units: 5,
    representative_name: 'Emmanuel Francis',
    contact_phone: '+91 98470 11004',
  });
  console.log(`[Success] Wards created: ${ward1.ward_name}, ${ward2.ward_name}, ${ward3.ward_name}, ${ward4.ward_name}`);

  // ==========================================
  // STEP B: Families (Households linked to Wards)
  // ==========================================
  console.log('Seeding Step B: Families...');
  // Ward 1 Households
  const fam1 = await Family.create({
    house_name: 'Ponnamattam House',
    family_name: 'Ponnamattam Family',
    family_code: 'FAM-101',
    ward: ward1._id,
    ward_id: ward1._id,
    unit_number: 'W1-U1',
    address: 'E5-225, KSHB Colony, Medical College P.O., Kozhikode',
    home_address: 'E5-225, KSHB Colony, Medical College P.O., Kozhikode',
    contact_number: '+91 98450 00001',
    reg_no: 'REG-2026-101',
    email: 'benny.ponnamattam@gmail.com',
    family_photo_url: null,
  });

  const fam2 = await Family.create({
    house_name: 'St. Joseph Villa',
    family_name: 'St. Joseph Family',
    family_code: 'FAM-102',
    ward: ward1._id,
    ward_id: ward1._id,
    unit_number: 'W1-U2',
    address: 'Church Road, Devagiri, Kozhikode',
    home_address: 'Church Road, Devagiri, Kozhikode',
    contact_number: '+91 98450 00002',
    reg_no: 'REG-2026-102',
    email: 'joseph.antony@gmail.com',
    family_photo_url: null,
  });

  // Ward 2 Households
  const fam3 = await Family.create({
    house_name: 'Kottoor Bhavan',
    family_name: 'Kottoor Family',
    family_code: 'FAM-201',
    ward: ward2._id,
    ward_id: ward2._id,
    unit_number: 'W2-U1',
    address: 'Green Lane, Devagiri, Kozhikode',
    home_address: 'Green Lane, Devagiri, Kozhikode',
    contact_number: '+91 98450 00003',
    reg_no: 'REG-2026-201',
    email: 'mathew.kottoor@gmail.com',
    family_photo_url: null,
  });

  const fam4 = await Family.create({
    house_name: 'Palackal Residence',
    family_name: 'Palackal Family',
    family_code: 'FAM-202',
    ward: ward2._id,
    ward_id: ward2._id,
    unit_number: 'W2-U2',
    address: 'Hill View Road, Devagiri, Kozhikode',
    home_address: 'Hill View Road, Devagiri, Kozhikode',
    contact_number: '+91 98450 00004',
    reg_no: 'REG-2026-202',
    email: 'george.palackal@gmail.com',
    family_photo_url: null,
  });

  // Ward 3 Households
  const fam5 = await Family.create({
    house_name: 'Kurian Cottage',
    family_name: 'Kurian Family',
    family_code: 'FAM-301',
    ward: ward3._id,
    ward_id: ward3._id,
    unit_number: 'W3-U1',
    address: 'Bypass Junction, Devagiri, Kozhikode',
    home_address: 'Bypass Junction, Devagiri, Kozhikode',
    contact_number: '+91 98450 00005',
    reg_no: 'REG-2026-301',
    email: 'thomas.kurian@gmail.com',
    family_photo_url: null,
  });

  // Ward 4 Households
  const fam6 = await Family.create({
    house_name: 'Grace Villa',
    family_name: 'Grace Family',
    family_code: 'FAM-401',
    ward: ward4._id,
    ward_id: ward4._id,
    unit_number: 'W4-U1',
    address: 'College Road, Devagiri, Kozhikode',
    home_address: 'College Road, Devagiri, Kozhikode',
    contact_number: '+91 98450 00006',
    reg_no: 'REG-2026-401',
    email: 'francis.grace@gmail.com',
    family_photo_url: null,
  });
  console.log('[Success] 6 Families created across 4 Wards.');

  // ==========================================
  // STEP C: Members / Parishioners
  // ==========================================
  console.log('Seeding Step C: Members / Parishioners...');
  
  // Family 1 Members (Ponnamattam)
  const m1 = await Parishioner.create({
    first_name: 'Benny',
    last_name: 'Ponnamattam',
    malayalam_name: 'ബെന്നി പൊന്നാമറ്റം',
    baptism_name: 'Benedict',
    gender: 'MALE',
    dob: '1975-05-12',
    relation_to_head: 'Head of Household',
    relationship_role: 'Husband',
    blood_group: 'O+',
    occupation: 'Engineer',
    phone_number: '+91 98450 00001',
    email: 'benny.ponnamattam@gmail.com',
    is_active: true,
    is_head_of_household: true,
    ward_id: ward1._id,
    sacraments: ['Baptism', 'First Communion', 'Confirmation', 'Holy Matrimony'],
    family: fam1._id,
    family_id: fam1._id,
  });

  const m2 = await Parishioner.create({
    first_name: 'Sophia',
    last_name: 'Ponnamattam',
    malayalam_name: 'സോഫിയാ പൊന്നാമറ്റം',
    baptism_name: 'Sophia',
    gender: 'FEMALE',
    dob: '1978-08-22',
    relation_to_head: 'Wife',
    relationship_role: 'Wife',
    blood_group: 'A+',
    occupation: 'Teacher',
    phone_number: '+91 98450 00012',
    email: 'sophia.ponnamattam@gmail.com',
    is_active: true,
    is_head_of_household: false,
    ward_id: ward1._id,
    sacraments: ['Baptism', 'First Communion', 'Confirmation', 'Holy Matrimony'],
    family: fam1._id,
    family_id: fam1._id,
  });

  const m3 = await Parishioner.create({
    first_name: 'Shilpa',
    last_name: 'Ponnamattam',
    malayalam_name: 'ഷിൽപ പൊന്നാമറ്റം',
    baptism_name: 'Maria',
    gender: 'FEMALE',
    dob: '2002-11-05',
    relation_to_head: 'Daughter',
    relationship_role: 'Daughter',
    blood_group: 'B+',
    occupation: 'Student',
    phone_number: '+91 98450 00013',
    email: 'shilpa.ponnamattam@gmail.com',
    is_active: true,
    is_head_of_household: false,
    ward_id: ward1._id,
    sacraments: ['Baptism', 'First Communion', 'Confirmation'],
    family: fam1._id,
    family_id: fam1._id,
  });

  // Family 2 Members (St. Joseph Family)
  const m4 = await Parishioner.create({
    first_name: 'Joseph',
    last_name: 'Antony',
    malayalam_name: 'ജോസഫ് ആന്റണി',
    baptism_name: 'Joseph',
    gender: 'MALE',
    dob: '1970-03-15',
    relation_to_head: 'Head of Household',
    relationship_role: 'Husband',
    blood_group: 'AB+',
    occupation: 'Businessman',
    phone_number: '+91 98450 00002',
    email: 'joseph.antony@gmail.com',
    is_active: true,
    is_head_of_household: true,
    ward_id: ward1._id,
    sacraments: ['Baptism', 'First Communion', 'Confirmation', 'Holy Matrimony'],
    family: fam2._id,
    family_id: fam2._id,
  });

  const m5 = await Parishioner.create({
    first_name: 'Mary',
    last_name: 'Antony',
    malayalam_name: 'മേരി ആന്റണി',
    baptism_name: 'Mary',
    gender: 'FEMALE',
    dob: '1974-06-20',
    relation_to_head: 'Wife',
    relationship_role: 'Wife',
    blood_group: 'O+',
    occupation: 'Homemaker',
    phone_number: '+91 98450 00022',
    email: 'mary.antony@gmail.com',
    is_active: true,
    is_head_of_household: false,
    ward_id: ward1._id,
    sacraments: ['Baptism', 'First Communion', 'Confirmation', 'Holy Matrimony'],
    family: fam2._id,
    family_id: fam2._id,
  });

  // Family 3 Members (Kottoor)
  const m6 = await Parishioner.create({
    first_name: 'Mathew',
    last_name: 'Kottoor',
    malayalam_name: 'മാത്യു കൊട്ടൂർ',
    baptism_name: 'Mathew',
    gender: 'MALE',
    dob: '1968-01-10',
    relation_to_head: 'Head of Household',
    relationship_role: 'Husband',
    blood_group: 'B+',
    occupation: 'Bank Manager',
    phone_number: '+91 98450 00003',
    email: 'mathew.kottoor@gmail.com',
    is_active: true,
    is_head_of_household: true,
    ward_id: ward2._id,
    sacraments: ['Baptism', 'First Communion', 'Confirmation', 'Holy Matrimony'],
    family: fam3._id,
    family_id: fam3._id,
  });

  // Family 4 Members (Palackal)
  const m7 = await Parishioner.create({
    first_name: 'George',
    last_name: 'Palackal',
    malayalam_name: 'ജോർജ് പാലക്കൽ',
    baptism_name: 'George',
    gender: 'MALE',
    dob: '1982-04-18',
    relation_to_head: 'Head of Household',
    relationship_role: 'Husband',
    blood_group: 'A+',
    occupation: 'Architect',
    phone_number: '+91 98450 00004',
    email: 'george.palackal@gmail.com',
    is_active: true,
    is_head_of_household: true,
    ward_id: ward2._id,
    sacraments: ['Baptism', 'First Communion', 'Confirmation', 'Holy Matrimony'],
    family: fam4._id,
    family_id: fam4._id,
  });

  // Family 5 Members (Kurian)
  const m8 = await Parishioner.create({
    first_name: 'Thomas',
    last_name: 'Kurian',
    malayalam_name: 'തോമസ് കുര്യൻ',
    baptism_name: 'Thomas',
    gender: 'MALE',
    dob: '1965-09-30',
    relation_to_head: 'Head of Household',
    relationship_role: 'Husband',
    blood_group: 'O-',
    occupation: 'Professor',
    phone_number: '+91 98450 00005',
    email: 'thomas.kurian@gmail.com',
    is_active: true,
    is_head_of_household: true,
    ward_id: ward3._id,
    sacraments: ['Baptism', 'First Communion', 'Confirmation', 'Holy Matrimony'],
    family: fam5._id,
    family_id: fam5._id,
  });

  // Family 6 Members (Grace)
  const m9 = await Parishioner.create({
    first_name: 'Francis',
    last_name: 'Grace',
    malayalam_name: 'ഫ്രാൻസിസ് ഗ്രേസ്',
    baptism_name: 'Francis',
    gender: 'MALE',
    dob: '1979-12-14',
    relation_to_head: 'Head of Household',
    relationship_role: 'Husband',
    blood_group: 'AB-',
    occupation: 'Doctor',
    phone_number: '+91 98450 00006',
    email: 'francis.grace@gmail.com',
    is_active: true,
    is_head_of_household: true,
    ward_id: ward4._id,
    sacraments: ['Baptism', 'First Communion', 'Confirmation', 'Holy Matrimony'],
    family: fam6._id,
    family_id: fam6._id,
  });

  // Update Head of Family references on Household records
  await Family.findByIdAndUpdate(fam1._id, { head_of_family: m1.first_name + ' ' + m1.last_name });
  await Family.findByIdAndUpdate(fam2._id, { head_of_family: m4.first_name + ' ' + m4.last_name });
  await Family.findByIdAndUpdate(fam3._id, { head_of_family: m6.first_name + ' ' + m6.last_name });
  await Family.findByIdAndUpdate(fam4._id, { head_of_family: m7.first_name + ' ' + m7.last_name });
  await Family.findByIdAndUpdate(fam5._id, { head_of_family: m8.first_name + ' ' + m8.last_name });
  await Family.findByIdAndUpdate(fam6._id, { head_of_family: m9.first_name + ' ' + m9.last_name });

  console.log('[Success] 9 Parishioner members seeded and household heads updated.');

  // ==========================================
  // STEP D: Clergy & Leadership
  // ==========================================
  console.log('Seeding Step D: Clergy & Leadership...');
  const vicar = await Clergy.create({
    name: 'Rev. Fr. Thomas Kottoor',
    role: 'Vicar',
    role_type: 'parish-priest',
    category: 'Priest',
    designation: 'Vicar / Parish Priest',
    phone_number: '+91 98470 00100',
    email: 'vicar.devagiriparish@gmail.com',
    avatar_url: null,
    display_order: 1,
    is_quick_contact: true,
    address: 'St. Joseph Parish Presbytery, Devagiri, Kozhikode',
    blood_group: 'O+',
  });

  const asstVicar = await Clergy.create({
    name: 'Rev. Fr. Joseph Alackal',
    role: 'Assistant Vicar',
    role_type: 'parish-priest',
    category: 'Priest',
    designation: 'Assistant Vicar',
    phone_number: '+91 98470 00101',
    email: 'asstvicar.devagiriparish@gmail.com',
    avatar_url: null,
    display_order: 2,
    is_quick_contact: true,
    address: 'St. Joseph Parish Presbytery, Devagiri, Kozhikode',
    blood_group: 'A+',
  });

  const residentPriest = await Clergy.create({
    name: 'Rev. Fr. Antony Varghese',
    role: 'Resident Priest',
    role_type: 'resident-priest',
    category: 'Priest',
    designation: 'Spiritual Director',
    phone_number: '+91 98470 00102',
    email: 'antony.varghese@gmail.com',
    avatar_url: null,
    display_order: 3,
    is_quick_contact: true,
    address: 'St. Joseph Parish Presbytery, Devagiri, Kozhikode',
    blood_group: 'B+',
  });
  console.log(`[Success] Clergy leadership created: ${vicar.name}, ${asstVicar.name}, ${residentPriest.name}`);

  // ==========================================
  // STEP E: Religious Houses (Convents & Seminaries)
  // ==========================================
  console.log('Seeding Step E: Religious Houses...');
  const convent1 = await ReligiousHouse.create({
    name: "St. Anne's Convent",
    category_type: 'Convent',
    category: 'Convent',
    superior_in_charge: 'Sr. Mary Agnes FCC',
    resident_count: 8,
    contact_number: '+91 495 2351001',
    email: 'stannesconvent.devagiri@gmail.com',
    address: 'Near St. Joseph Church, Devagiri, Kozhikode - 673008',
    photo_url: null,
    residents: [
      { name: 'Sr. Mary Agnes FCC', designation: 'Mother Superior', phone: '+91 98460 00101', email: 'sr.agnes@gmail.com' },
      { name: 'Sr. Clare Francis FCC', designation: 'Vice Superior', phone: '+91 98460 00102', email: 'sr.clare@gmail.com' },
      { name: 'Sr. Theresa Martin FCC', designation: 'Nurse & Social Worker', phone: '+91 98460 00103', email: 'sr.theresa@gmail.com' },
      { name: 'Sr. Rose Varghese FCC', designation: 'Teacher', phone: '+91 98460 00104', email: 'sr.rose@gmail.com' },
    ],
  });

  const convent2 = await ReligiousHouse.create({
    name: 'Holy Family Convent & Provincialate',
    category_type: 'Convent',
    category: 'Convent',
    superior_in_charge: 'Sr. Grace Catherine CHF',
    resident_count: 12,
    contact_number: '+91 495 2351002',
    email: 'holyfamilyconvent.devagiri@gmail.com',
    address: 'Medical College Road, Devagiri, Kozhikode - 673008',
    photo_url: null,
    residents: [
      { name: 'Sr. Grace Catherine CHF', designation: 'Provincial Superior', phone: '+91 98460 00201', email: 'sr.grace@gmail.com' },
      { name: 'Sr. Lucy Joseph CHF', designation: 'Bursar', phone: '+91 98460 00202', email: 'sr.lucy@gmail.com' },
      { name: 'Sr. Rita Paul CHF', designation: 'School Principal', phone: '+91 98460 00203', email: 'sr.rita@gmail.com' },
    ],
  });
  console.log(`[Success] Religious Houses created: ${convent1.name}, ${convent2.name}`);

  // ==========================================
  // STEP F: Ministries & Pious Associations
  // ==========================================
  console.log('Seeding Step F: Ministries & Organizations...');
  const org1 = await Organization.create({
    name_en: 'St. Vincent de Paul Society',
    name_ml: 'സെന്റ് വിൻസെന്റ് ഡി പോൾ സൊസൈറ്റി',
    title: 'St. Vincent de Paul Society',
    category: 'ministry',
    description: 'Parish charitable ministry providing aid to needy families, medical support, and education funds.',
    icon_symbol: 'heart-handshake',
    members: [
      { parishioner: m1._id, member_id: m1._id, role: 'President', role_title: 'President', display_order: 1 },
      { parishioner: m6._id, member_id: m6._id, role: 'Secretary', role_title: 'Secretary', display_order: 2 },
      { parishioner: m4._id, member_id: m4._id, role: 'Treasurer', role_title: 'Treasurer', display_order: 3 },
    ],
  });

  const org2 = await Organization.create({
    name_en: 'Altar Angels (Altar Servers)',
    name_ml: 'അൾത്താര ബാലസഖ്യം',
    title: 'Altar Angels (Altar Servers)',
    category: 'ministry',
    description: 'Youth and children dedicated to serving holy mass and liturgical celebrations at the altar.',
    icon_symbol: 'sparkles',
    members: [
      { parishioner: m3._id, member_id: m3._id, role: 'Leader', role_title: 'Youth Coordinator', display_order: 1 },
    ],
  });

  const org3 = await Organization.create({
    name_en: 'Parish Choir',
    name_ml: 'ദേവാലയ ഗായകസംഗം',
    title: 'Parish Choir',
    category: 'ministry',
    description: 'Spirited liturgical choir leading Sunday holy Qurbana and feast day celebrations in song.',
    icon_symbol: 'music',
    members: [
      { parishioner: m2._id, member_id: m2._id, role: 'Choir Director', role_title: 'Choir Director', display_order: 1 },
      { parishioner: m7._id, member_id: m7._id, role: 'Organist', role_title: 'Organist', display_order: 2 },
    ],
  });

  const org4 = await Organization.create({
    name_en: 'KCYM Youth Movement',
    name_ml: 'കെ.സി.വൈ.എം യുവജന പ്രസ്ഥാനം',
    title: 'KCYM Youth Movement',
    category: 'ministry',
    description: 'Kerala Catholic Youth Movement empowering Catholic youth in parish leadership and community service.',
    icon_symbol: 'users',
    members: [
      { parishioner: m3._id, member_id: m3._id, role: 'President', role_title: 'Youth President', display_order: 1 },
    ],
  });
  console.log(`[Success] Ministries created: ${org1.name_en}, ${org2.name_en}, ${org3.name_en}, ${org4.name_en}`);

  // ==========================================
  // STEP G: Announcements (English & Malayalam)
  // ==========================================
  console.log('Seeding Step G: Announcements...');
  const ann1 = await Announcement.create({
    title: 'ഞായറാഴ്ച വിശുദ്ധ കുർബാന സമയം & ഇടവക അറിയിപ്പുകൾ',
    content: 'എല്ലാ ഞായറാഴ്ചകളിലും രാവിലെ 6:30 AM & 10:00 AM എന്നീ സമയങ്ങളിൽ വിശുദ്ധ കുർബാന അർപ്പിക്കപ്പെടുന്നതാണ്. വൈകുന്നേരം 5:00 നും ദിവ്യബലി ഉണ്ടായിരിക്കുന്നതാണ്. സർവ്വ കുടുംബാംഗങ്ങളും സമയബന്ധിതമായി പങ്കെടുക്കണമെന്ന് അഭ്യർത്ഥിക്കുന്നു.',
    priority: 'high',
    is_active: true,
    announcement_date: new Date(),
  });

  const ann2 = await Announcement.create({
    title: 'മാർ യൗസേപ്പ് തിരുനാൾ നൊവേന ആരംഭിക്കുന്നു',
    content: 'നമ്മുടെ ഇടവകയുടെ സംരക്ഷകനായ വിശുദ്ധ യൗസേപ്പിതാവിന്റെ തിരുനാൾ നൊവേന വരും തിങ്കളാഴ്ച മുതൽ എല്ലാ ദിവസവും വൈകുന്നേരം 6:00 മണിക്ക് അൾത്താരയിൽ വച്ച് ആരംഭിക്കുന്നു.',
    priority: 'medium',
    is_active: true,
    announcement_date: new Date(),
  });

  const ann3 = await Announcement.create({
    title: 'Catechism & Sunday School Registration 2026',
    content: 'Registration for Sunday School classes for academic year 2026-2027 is now open. Parents can register their children after the 10:00 AM Mass this Sunday.',
    priority: 'medium',
    is_active: true,
    announcement_date: new Date(),
  });
  console.log('[Success] 3 Announcements created (including Malayalam Sunday Mass timing bullet).');

  // ==========================================
  // STEP H: Calendar & Mass Timings
  // ==========================================
  console.log('Seeding Step H: Calendar & Mass Schedules...');
  await MassSchedule.create([
    {
      day_type: 'Sunday',
      time_slot: 'രാവിലെ 6:30 AM & 10:00 AM',
      description_en: 'Sunday Morning Holy Qurbana (Solemn Liturgy)',
      description_ml: 'ഞായറാഴ്ച പ്രഭാത വിശുദ്ധ കുർബാന',
    },
    {
      day_type: 'Sunday Evening',
      time_slot: 'വൈകുന്നേരം 5:00 PM',
      description_en: 'Sunday Evening Mass & Novena',
      description_ml: 'ഞായറാഴ്ച സന്ധ്യാ കുർബാന',
    },
    {
      day_type: 'Weekday (Mon - Sat)',
      time_slot: 'രാവിലെ 6:30 AM & 7:00 AM',
      description_en: 'Daily Morning Mass',
      description_ml: 'പ്രവൃത്തിദിന പ്രഭാത കുർബാന',
    },
  ]);

  await Event.create([
    {
      target_date: '2026-03-19',
      event_date: '2026-03-19',
      title_en: 'Feast of St. Joseph',
      title_ml: 'മാർ യൗസേപ്പിന്റെ പ്രധാന തിരുനാൾ',
      title: 'Feast of St. Joseph',
      mass_time: 'രാവിലെ 6:30 AM & 10:00 AM',
      type_badge: 'Feast',
      location: 'Main Sanctuary',
      description_en: 'Patron Feast Day celebration with solemn high mass and community feast meal.',
      description_ml: 'ഇടവക മധ്യസ്ഥനായ വിശുദ്ധ യൗസേപ്പിതാവിന്റെ ആഘോഷമായ തിരുനാൾ ബലി.',
      description: 'Patron Feast Day celebration with solemn high mass and community feast meal.',
    },
    {
      target_date: '2026-06-13',
      event_date: '2026-06-13',
      title_en: 'Feast of St. Anthony of Padua',
      title_ml: 'വിശുദ്ധ അന്തോനീസിന്റെ തിരുനാൾ',
      title: 'Feast of St. Anthony of Padua',
      mass_time: 'രാവിലെ 6:30 AM & 10:00 AM',
      type_badge: 'Feast',
      location: 'Main Sanctuary',
      description_en: 'Feast of St. Anthony with novena, holy mass, and distribution of blessed bread.',
      description_ml: 'വിശുദ്ധ അന്തോനീസിന്റെ നൊവേനയും അപ്പം നേർച്ച വിതരണവും.',
      description: 'Feast of St. Anthony with novena, holy mass, and distribution of blessed bread.',
    },
  ]);
  console.log('[Success] Mass Schedules and Events seeded.');

  // ==========================================
  // Parish Council Seeding
  // ==========================================
  console.log('Seeding Parish Council Leadership...');
  await ParishCouncil.create([
    { member_id: m1._id, role_title: 'Parish Secretary', committee_type: 'Executive Committee', ward_id: ward1._id, display_order: 1 },
    { member_id: m6._id, role_title: 'Parish Trustee (Finance)', committee_type: 'Executive Committee', ward_id: ward2._id, display_order: 2 },
    { member_id: m8._id, role_title: 'Ward 3 Representative', committee_type: 'Ward Representatives', ward_id: ward3._id, display_order: 3 },
    { member_id: m9._id, role_title: 'Ward 4 Representative', committee_type: 'Ward Representatives', ward_id: ward4._id, display_order: 4 },
  ]);
  console.log('[Success] Parish Council seeded.');

  console.log('\n==================================================');
  console.log('✨ ALL TABLES & COLLECTIONS SEEDED SUCCESSFULLY!');
  console.log('==================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
