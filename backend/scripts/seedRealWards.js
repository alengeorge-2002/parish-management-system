const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Ward = require('../models/Ward');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devagiri_parish_db';

const realWards = [
  {
    wardNumber: 1,
    ward_number: 1,
    wardName: 'St. ALPHONSA WARD',
    ward_name: 'St. ALPHONSA WARD, DEVAGIRI',
    area: 'DEVAGIRI',
    representativeName: 'Rosamma Edathil',
    representative_name: 'Rosamma Edathil',
    contactPhone: '+91 94470 11209',
    contact_phone: '+91 94470 11209',
    totalFamilies: 69,
    total_units: 4,
    units: [{ unitNumber: 'Unit I' }, { unitNumber: 'Unit II' }, { unitNumber: 'Unit III' }, { unitNumber: 'Unit IV' }]
  },
  {
    wardNumber: 2,
    ward_number: 2,
    wardName: 'St. CHAVARA WARD',
    ward_name: 'St. CHAVARA WARD, DEVAGIRI',
    area: 'DEVAGIRI',
    representativeName: 'Paulose Karottu',
    representative_name: 'Paulose Karottu',
    contactPhone: '+91 94470 11210',
    contact_phone: '+91 94470 11210',
    totalFamilies: 65,
    total_units: 3,
    units: [{ unitNumber: 'Unit I' }, { unitNumber: 'Unit II' }, { unitNumber: 'Unit III' }]
  },
  {
    wardNumber: 3,
    ward_number: 3,
    wardName: 'CHRIST THE KING WARD',
    ward_name: 'CHRIST THE KING WARD, KOVOOR SOUTH',
    area: 'KOVOOR SOUTH',
    representativeName: 'Antony Kurian',
    representative_name: 'Antony Kurian',
    contactPhone: '+91 98450 00008',
    contact_phone: '+91 98450 00008',
    totalFamilies: 47,
    total_units: 2,
    units: [{ unitNumber: 'Unit I' }, { unitNumber: 'Unit II' }]
  },
  {
    wardNumber: 4,
    ward_number: 4,
    wardName: 'St. JOSEPH’S WARD',
    ward_name: 'St. JOSEPH’S WARD, MEDICAL COLLEGE',
    area: 'MEDICAL COLLEGE',
    representativeName: 'Sunny Sebastian',
    representative_name: 'Sunny Sebastian',
    contactPhone: '+91 98450 00010',
    contact_phone: '+91 98450 00010',
    totalFamilies: 68,
    total_units: 4,
    units: [{ unitNumber: 'Unit I' }, { unitNumber: 'Unit II' }, { unitNumber: 'Unit III' }, { unitNumber: 'Unit IV' }]
  },
  {
    wardNumber: 5,
    ward_number: 5,
    wardName: 'St. LITTLE FLOWER WARD',
    ward_name: 'St. LITTLE FLOWER WARD, MAYANAD',
    area: 'MAYANAD',
    representativeName: 'Mary Vadakkel',
    representative_name: 'Mary Vadakkel',
    contactPhone: '+91 94470 11206',
    contact_phone: '+91 94470 11206',
    totalFamilies: 83,
    total_units: 3,
    units: [{ unitNumber: 'Unit I' }, { unitNumber: 'Unit II' }, { unitNumber: 'Unit III' }]
  },
  {
    wardNumber: 6,
    ward_number: 6,
    wardName: 'MARYLAND WARD',
    ward_name: 'MARYLAND WARD, KOVOOR NORTH',
    area: 'KOVOOR NORTH',
    representativeName: 'Baby Joseph',
    representative_name: 'Baby Joseph',
    contactPhone: '+91 98450 00009',
    contact_phone: '+91 98450 00009',
    totalFamilies: 77,
    total_units: 3,
    units: [{ unitNumber: 'Unit I' }, { unitNumber: 'Unit II' }, { unitNumber: 'Unit III' }]
  },
  {
    wardNumber: 7,
    ward_number: 7,
    wardName: 'St. MOTHER THERESA WARD',
    ward_name: 'St. MOTHER THERESA WARD, MUNDIKKALTHAZHAM',
    area: 'MUNDIKKALTHAZHAM',
    representativeName: 'Mini Mathew',
    representative_name: 'Mini Mathew',
    contactPhone: '+91 98450 00011',
    contact_phone: '+91 98450 00011',
    totalFamilies: 47,
    total_units: 2,
    units: [{ unitNumber: 'Unit I' }, { unitNumber: 'Unit II' }]
  },
  {
    wardNumber: 8,
    ward_number: 8,
    wardName: 'St. THOMAS WARD',
    ward_name: 'St. THOMAS WARD, VELLIPARAMBA',
    area: 'VELLIPARAMBA',
    representativeName: 'George Mathew',
    representative_name: 'George Mathew',
    contactPhone: '+91 98450 00012',
    contact_phone: '+91 98450 00012',
    totalFamilies: 81,
    total_units: 3,
    units: [{ unitNumber: 'Unit I' }, { unitNumber: 'Unit II' }, { unitNumber: 'Unit III' }]
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Clearing old wards collection...');
  await Ward.deleteMany({});
  await Ward.insertMany(realWards);
  console.log('✅ Successfully seeded all 8 real directory wards with units!');
  process.exit(0);
}
seed();
