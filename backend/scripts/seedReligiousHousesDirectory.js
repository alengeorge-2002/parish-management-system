const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const ReligiousHouse = require('../models/ReligiousHouse');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devagiri_parish_db';

const realReligiousHouses = [
  // --- WOMEN'S RELIGIOUS HOUSES (CONVENTS) ---
  {
    name: 'Carmelite Convent (CMC)',
    malayalamName: 'കാർമ്മലൈറ്റ് കോൺവെന്റ് (CMC)',
    houseType: 'women',
    house_type: 'women',
    category_type: 'women',
    category: 'Convent',
    superiorInCharge: 'Sr. Superior CMC',
    superior_in_charge: 'Sr. Superior CMC',
    contactNumber: '+91 98765 43210',
    contact_number: '+91 98765 43210',
    established: '1980',
    residentCount: 5,
    resident_count: 5,
    residents: [
      { name: 'Sr. Superior CMC', fullName: 'Sr. Superior CMC', religiousName: 'Sr. Superior CMC', designation: 'Mother Superior', phone: '+91 98765 43210', gender: 'F' },
      { name: 'Sr. Rose Therese CMC', fullName: 'Sr. Rose Therese CMC', religiousName: 'Sr. Rose Therese CMC', designation: 'Headmistress', phone: '+91 98765 43211', gender: 'F' },
      { name: 'Sr. Alphonsa CMC', fullName: 'Sr. Alphonsa CMC', religiousName: 'Sr. Alphonsa CMC', designation: 'Staff Nurse', phone: '+91 98765 43212', gender: 'F' },
      { name: 'Sr. Mary Grace CMC', fullName: 'Sr. Mary Grace CMC', religiousName: 'Sr. Mary Grace CMC', designation: 'Catechist', phone: '+91 98765 43213', gender: 'F' },
      { name: 'Sr. Agnes CMC', fullName: 'Sr. Agnes CMC', religiousName: 'Sr. Agnes CMC', designation: 'Social Worker', phone: '+91 98765 43214', gender: 'F' }
    ]
  },
  {
    name: 'Holy Family Convent & Provincialate (CHF)',
    malayalamName: 'ഹോളി ഫാമിലി കോൺവെന്റ് (CHF)',
    houseType: 'women',
    house_type: 'women',
    category_type: 'women',
    category: 'Convent',
    superiorInCharge: 'Sr. Grace Catherine CHF',
    superior_in_charge: 'Sr. Grace Catherine CHF',
    contactNumber: '+91 495 2351002',
    contact_number: '+91 495 2351002',
    established: '1980',
    residentCount: 4,
    resident_count: 4,
    residents: [
      { name: 'Sr. Grace Catherine CHF', fullName: 'Sr. Grace Catherine CHF', religiousName: 'Sr. Grace Catherine CHF', designation: 'Provincial Superior', phone: '+91 495 2351002', gender: 'F' },
      { name: 'Sr. Ancy CHF', fullName: 'Sr. Ancy CHF', religiousName: 'Sr. Ancy CHF', designation: 'Provincial Councilor', phone: '+91 495 2351003', gender: 'F' },
      { name: 'Sr. Philo CHF', fullName: 'Sr. Philo CHF', religiousName: 'Sr. Philo CHF', designation: 'Administrator', phone: '+91 495 2351004', gender: 'F' },
      { name: 'Sr. Kochuthresia CHF', fullName: 'Sr. Kochuthresia CHF', religiousName: 'Sr. Kochuthresia CHF', designation: 'Senior Sister', phone: '+91 495 2351005', gender: 'F' }
    ]
  },
  {
    name: 'Mercy Convent',
    malayalamName: 'മേഴ്സി കോൺവെന്റ്',
    houseType: 'women',
    house_type: 'women',
    category_type: 'women',
    category: 'Convent',
    superiorInCharge: 'Sr. Superior',
    superior_in_charge: 'Sr. Superior',
    contactNumber: '+91 98765 43210',
    contact_number: '+91 98765 43210',
    established: '1980',
    residentCount: 3,
    resident_count: 3,
    residents: [
      { name: 'Sr. Superior', fullName: 'Sr. Superior', religiousName: 'Sr. Superior', designation: 'Superior', phone: '+91 98765 43210', gender: 'F' },
      { name: 'Sr. Mercy Maria', fullName: 'Sr. Mercy Maria', religiousName: 'Sr. Mercy Maria', designation: 'Staff Nurse', phone: '+91 98765 43215', gender: 'F' },
      { name: 'Sr. Jositta', fullName: 'Sr. Jositta', religiousName: 'Sr. Jositta', designation: 'Teacher', phone: '+91 98765 43216', gender: 'F' }
    ]
  },
  {
    name: 'St. Anne’s Convent (FCC)',
    malayalamName: 'സെന്റ് ആൻസ് കോൺവെന്റ് (FCC)',
    houseType: 'women',
    house_type: 'women',
    category_type: 'women',
    category: 'Convent',
    superiorInCharge: 'Sr. Mary Agnes FCC',
    superior_in_charge: 'Sr. Mary Agnes FCC',
    contactNumber: '+91 98765 43220',
    contact_number: '+91 98765 43220',
    established: '1980',
    residentCount: 3,
    resident_count: 3,
    residents: [
      { name: 'Sr. Mary Agnes FCC', fullName: 'Sr. Mary Agnes FCC', religiousName: 'Sr. Mary Agnes FCC', designation: 'Superior', phone: '+91 98765 43220', gender: 'F' },
      { name: 'Sr. Clara FCC', fullName: 'Sr. Clara FCC', religiousName: 'Sr. Clara FCC', designation: 'Member', phone: '+91 98765 43221', gender: 'F' },
      { name: 'Sr. Teresa FCC', fullName: 'Sr. Teresa FCC', religiousName: 'Sr. Teresa FCC', designation: 'Member', phone: '+91 98765 43222', gender: 'F' }
    ]
  },

  // --- MEN'S RELIGIOUS HOUSES (MONASTERIES / BHAVANS) ---
  {
    name: 'St. Joseph’s Monastery (CMI)',
    malayalamName: 'സെന്റ് ജോസഫ്സ് മൊണാസ്ട്രി (CMI)',
    houseType: 'men',
    house_type: 'men',
    category_type: 'men',
    category: 'Monastery',
    superiorInCharge: 'Fr. Prior CMI',
    superior_in_charge: 'Fr. Prior CMI',
    contactNumber: '+91 495 2356789',
    contact_number: '+91 495 2356789',
    established: '1980',
    residentCount: 5,
    resident_count: 5,
    residents: [
      { name: 'Fr. Prior CMI', fullName: 'Fr. Prior CMI', religiousName: 'Fr. Prior CMI', designation: 'Prior', phone: '+91 495 2356789', gender: 'M' },
      { name: 'Fr. George Pulimoottil CMI', fullName: 'Fr. George Pulimoottil CMI', religiousName: 'Fr. George Pulimoottil CMI', designation: 'Parish Vicar', phone: '+91 94470 11223', gender: 'M' },
      { name: 'Fr. Thomas Kalarickal CMI', fullName: 'Fr. Thomas Kalarickal CMI', religiousName: 'Fr. Thomas Kalarickal CMI', designation: 'Assistant Vicar', phone: '+91 94470 22334', gender: 'M' },
      { name: 'Fr. Mathew CMI', fullName: 'Fr. Mathew CMI', religiousName: 'Fr. Mathew CMI', designation: 'Bursar', phone: '+91 495 2356790', gender: 'M' },
      { name: 'Bro. Paul CMI', fullName: 'Bro. Paul CMI', religiousName: 'Bro. Paul CMI', designation: 'Regent', phone: '+91 495 2356791', gender: 'M' }
    ]
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  await ReligiousHouse.deleteMany({});
  await ReligiousHouse.insertMany(realReligiousHouses);
  console.log('✅ Successfully seeded all Religious Houses with categorized gender and resident members!');
  process.exit(0);
}

seed();
