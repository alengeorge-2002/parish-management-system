const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const Ward = require('../models/Ward');
const Family = require('../models/Family');
const Parishioner = require('../models/Parishioner');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devagiri_parish_db';

const officialWardsData = [
  {
    wardNumber: 1,
    ward_number: 1,
    wardName: 'St. ALPHONSA WARD',
    ward_name: 'St. ALPHONSA WARD, DEVAGIRI',
    area: 'DEVAGIRI',
    representativeName: 'Varghese Mathew',
    representative_name: 'Varghese Mathew',
    contactPhone: '+91 94471 00001',
    contact_phone: '+91 94471 00001',
    units: [
      { unitNumber: 'Unit I', unit_number: 'Unit I' },
      { unitNumber: 'Unit II', unit_number: 'Unit II' },
      { unitNumber: 'Unit III', unit_number: 'Unit III' },
      { unitNumber: 'Unit IV', unit_number: 'Unit IV' }
    ],
    families: [
      {
        familyCode: 'F-101',
        familyName: 'Thekkedathu Family',
        houseName: 'Thekkedathu House',
        unit: 'Unit I',
        address: 'E5-220, Devagiri Colony, Medical College P.O., Kozhikode - 673008',
        phone: '+91 98470 10101',
        email: 'thekkedathu@devagiriparish.com',
        members: [
          { firstName: 'Joseph', lastName: 'Thekkedathu', nameMl: 'ജോസഫ് തെക്കേടത്ത്', baptismName: 'Joseph', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 10101' },
          { firstName: 'Mary', lastName: 'Thekkedathu', nameMl: 'മേരി തെക്കേടത്ത്', baptismName: 'Mary', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 10102' },
          { firstName: 'Paul', lastName: 'Thekkedathu', nameMl: 'പോൾ തെക്കേടത്ത്', baptismName: 'Paul', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 10103' },
          { firstName: 'Anna', lastName: 'Thekkedathu', nameMl: 'അന്ന തെക്കേടത്ത്', baptismName: 'Anna', gender: 'FEMALE', rel: 'Daughter', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 10104' }
        ]
      },
      {
        familyCode: 'F-102',
        familyName: 'Kallarakkal Family',
        houseName: 'Kallarakkal House',
        unit: 'Unit II',
        address: 'E5-224, Devagiri Main Road, Kozhikode - 673008',
        phone: '+91 98470 10201',
        email: 'kallarakkal@devagiriparish.com',
        members: [
          { firstName: 'Thomas', lastName: 'Kallarakkal', nameMl: 'തോമസ് കല്ലറക്കൽ', baptismName: 'Thomas', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 10201' },
          { firstName: 'Grace', lastName: 'Kallarakkal', nameMl: 'ഗ്രേസ് കല്ലറക്കൽ', baptismName: 'Grace', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 10202' },
          { firstName: 'George', lastName: 'Kallarakkal', nameMl: 'ജോർജ് കല്ലറക്കൽ', baptismName: 'George', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 10203' }
        ]
      },
      {
        familyCode: 'F-103',
        familyName: 'Ponnamattam Family',
        houseName: 'Ponnamattam House',
        unit: 'Unit III',
        address: 'E5-225, KSHB Colony, Medical College P.O., Kozhikode - 673008',
        phone: '+91 98470 10301',
        email: 'ponnamattam@devagiriparish.com',
        members: [
          { firstName: 'Benny', lastName: 'Ponnamattam', nameMl: 'ബെന്നി പൊന്നാങ്കാട്ടിൽ', baptismName: 'Benedict', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 10301' },
          { firstName: 'Sophia', lastName: 'Ponnamattam', nameMl: 'സോഫിയ പൊന്നാങ്കാട്ടിൽ', baptismName: 'Sophia', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 10302' },
          { firstName: 'Shilpa', lastName: 'Ponnamattam', nameMl: 'ശിൽപ പൊന്നാങ്കാട്ടിൽ', baptismName: 'Cecilia', gender: 'FEMALE', rel: 'Daughter', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 10303' },
          { firstName: 'Richard', lastName: 'Ponnamattam', nameMl: 'റിച്ച്‌സ് പൊന്നാങ്കാട്ടിൽ', baptismName: 'Richard', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 10304' }
        ]
      },
      {
        familyCode: 'F-104',
        familyName: 'Maliyekkal Family',
        houseName: 'Maliyekkal House',
        unit: 'Unit IV',
        address: 'E5-230, Devagiri Hillview, Kozhikode - 673008',
        phone: '+91 98470 10401',
        email: 'maliyekkal@devagiriparish.com',
        members: [
          { firstName: 'Antony', lastName: 'Maliyekkal', nameMl: 'ആന്റണി മാളിയേക്കൽ', baptismName: 'Antony', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 10401' },
          { firstName: 'Teresa', lastName: 'Maliyekkal', nameMl: 'തെരേസ മാളിയേക്കൽ', baptismName: 'Teresa', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 10402' },
          { firstName: 'David', lastName: 'Maliyekkal', nameMl: 'ഡേവിഡ് മാളിയേക്കൽ', baptismName: 'David', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 10403' }
        ]
      }
    ]
  },
  {
    wardNumber: 2,
    ward_number: 2,
    wardName: 'St. CHAVARA WARD',
    ward_name: 'St. CHAVARA WARD, DEVAGIRI',
    area: 'DEVAGIRI',
    representativeName: 'Joseph Kuriakose',
    representative_name: 'Joseph Kuriakose',
    contactPhone: '+91 94471 00002',
    contact_phone: '+91 94471 00002',
    units: [
      { unitNumber: 'Unit I', unit_number: 'Unit I' },
      { unitNumber: 'Unit II', unit_number: 'Unit II' },
      { unitNumber: 'Unit III', unit_number: 'Unit III' }
    ],
    families: [
      {
        familyCode: 'F-201',
        familyName: 'Pazhampally Family',
        houseName: 'Pazhampally House',
        unit: 'Unit I',
        address: 'C2-110, Devagiri Chavara Lane, Kozhikode - 673008',
        phone: '+91 98470 20101',
        email: 'pazhampally@devagiriparish.com',
        members: [
          { firstName: 'Kurian', lastName: 'Pazhampally', nameMl: 'കുര്യൻ പഴമ്പള്ളി', baptismName: 'Cyriac', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 20101' },
          { firstName: 'Elsy', lastName: 'Pazhampally', nameMl: 'എൽസി പഴമ്പള്ളി', baptismName: 'Elizabeth', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 20102' },
          { firstName: 'Mathew', lastName: 'Pazhampally', nameMl: 'മാത്യു പഴമ്പള്ളി', baptismName: 'Mathew', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 20103' }
        ]
      },
      {
        familyCode: 'F-202',
        familyName: 'Kalarickal Family',
        houseName: 'Kalarickal House',
        unit: 'Unit II',
        address: 'C2-115, Devagiri Garden, Kozhikode - 673008',
        phone: '+91 98470 20201',
        email: 'kalarickal@devagiriparish.com',
        members: [
          { firstName: 'Varghese', lastName: 'Kalarickal', nameMl: 'വർഗീസ് കളരിക്കൽ', baptismName: 'George', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 20201' },
          { firstName: 'Rosamma', lastName: 'Kalarickal', nameMl: 'റോസമ്മ കളരിക്കൽ', baptismName: 'Rose', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 20202' },
          { firstName: 'Sebastian', lastName: 'Kalarickal', nameMl: 'സെബസ്ത്യാനോസ് കളരിക്കൽ', baptismName: 'Sebastian', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 20203' },
          { firstName: 'Maria', lastName: 'Kalarickal', nameMl: 'മരിയ കളരിക്കൽ', baptismName: 'Maria', gender: 'FEMALE', rel: 'Daughter', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 20204' }
        ]
      },
      {
        familyCode: 'F-203',
        familyName: 'Karottu Family',
        houseName: 'Karottu House',
        unit: 'Unit III',
        address: 'C2-120, Chavara Heights, Kozhikode - 673008',
        phone: '+91 98470 20301',
        email: 'karottu@devagiriparish.com',
        members: [
          { firstName: 'Paulose', lastName: 'Karottu', nameMl: 'പൗലോസ് കരോട്ട്', baptismName: 'Paul', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 20301' },
          { firstName: 'Bridget', lastName: 'Karottu', nameMl: 'ബ്രിഡ്ജറ്റ് കരോട്ട്', baptismName: 'Bridget', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 20302' },
          { firstName: 'Francis', lastName: 'Karottu', nameMl: 'ഫ്രാൻസിസ് കരോട്ട്', baptismName: 'Francis', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 20303' }
        ]
      },
      {
        familyCode: 'F-204',
        familyName: 'Palathinkal Family',
        houseName: 'Palathinkal House',
        unit: 'Unit I',
        address: 'C2-128, Devagiri Park, Kozhikode - 673008',
        phone: '+91 98470 20401',
        email: 'palathinkal@devagiriparish.com',
        members: [
          { firstName: 'Devassy', lastName: 'Palathinkal', nameMl: 'ദേവസ്സി പാലത്തിങ്കൽ', baptismName: 'Sebastian', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 20401' },
          { firstName: 'Philomena', lastName: 'Palathinkal', nameMl: 'ഫിലോമിന പാലത്തിങ്കൽ', baptismName: 'Philomena', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 20402' },
          { firstName: 'Stephen', lastName: 'Palathinkal', nameMl: 'സ്റ്റീഫൻ പാലത്തിങ്കൽ', baptismName: 'Stephen', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 20403' }
        ]
      }
    ]
  },
  {
    wardNumber: 3,
    ward_number: 3,
    wardName: 'CHRIST THE KING WARD',
    ward_name: 'CHRIST THE KING WARD, KOVOOR SOUTH',
    area: 'KOVOOR SOUTH',
    representativeName: 'Antony Chacko',
    representative_name: 'Antony Chacko',
    contactPhone: '+91 94471 00003',
    contact_phone: '+91 94471 00003',
    units: [
      { unitNumber: 'Unit I', unit_number: 'Unit I' },
      { unitNumber: 'Unit II', unit_number: 'Unit II' }
    ],
    families: [
      {
        familyCode: 'F-301',
        familyName: 'Kochupurackal Family',
        houseName: 'Kochupurackal House',
        unit: 'Unit I',
        address: 'K3-012, Kovoor South Road, Kozhikode - 673017',
        phone: '+91 98470 30101',
        email: 'kochupurackal@devagiriparish.com',
        members: [
          { firstName: 'Antony', lastName: 'Kochupurackal', nameMl: 'അന്തോണി കൊച്ചുപുരയ്ക്കൽ', baptismName: 'Antony', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 30101' },
          { firstName: 'Annamma', lastName: 'Kochupurackal', nameMl: 'അന്നമ്മ കൊച്ചുപുരയ്ക്കൽ', baptismName: 'Anne', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 30102' },
          { firstName: 'Baby', lastName: 'Kochupurackal', nameMl: 'ബേബി കൊച്ചുപുരയ്ക്കൽ', baptismName: 'Joseph', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 30103' }
        ]
      },
      {
        familyCode: 'F-302',
        familyName: 'Manjaly Family',
        houseName: 'Manjaly House',
        unit: 'Unit II',
        address: 'K3-018, Kovoor South Colony, Kozhikode - 673017',
        phone: '+91 98470 30201',
        email: 'manjaly@devagiriparish.com',
        members: [
          { firstName: 'Cyriac', lastName: 'Manjaly', nameMl: 'കുര്യൻ മഞ്ഞളി', baptismName: 'Cyriac', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 30201' },
          { firstName: 'Kochuthresia', lastName: 'Manjaly', nameMl: 'കൊച്ചുത്രേസ്യാ മഞ്ഞളി', baptismName: 'Theresa', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 30202' },
          { firstName: 'Johny', lastName: 'Manjaly', nameMl: 'ജോണി മഞ്ഞളി', baptismName: 'John', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 30203' },
          { firstName: 'Thresia', lastName: 'Manjaly', nameMl: 'ത്രേസ്യാ മഞ്ഞളി', baptismName: 'Theresa', gender: 'FEMALE', rel: 'Daughter', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 30204' }
        ]
      },
      {
        familyCode: 'F-303',
        familyName: 'Thundiyil Family',
        houseName: 'Thundiyil House',
        unit: 'Unit I',
        address: 'K3-025, Christ Nagar, Kovoor, Kozhikode - 673017',
        phone: '+91 98470 30301',
        email: 'thundiyil@devagiriparish.com',
        members: [
          { firstName: 'Elias', lastName: 'Thundiyil', nameMl: 'ഏലിയാസ് തുണ്ടിയേൽ', baptismName: 'Elias', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 30301' },
          { firstName: 'Gracy', lastName: 'Thundiyil', nameMl: 'ഗ്രേസി തുണ്ടിയേൽ', baptismName: 'Grace', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 30302' },
          { firstName: 'Peter', lastName: 'Thundiyil', nameMl: 'പീറ്റർ തുണ്ടിയേൽ', baptismName: 'Peter', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 30303' }
        ]
      }
    ]
  },
  {
    wardNumber: 4,
    ward_number: 4,
    wardName: 'St. JOSEPH’S WARD',
    ward_name: 'St. JOSEPH’S WARD, MEDICAL COLLEGE',
    area: 'MEDICAL COLLEGE',
    representativeName: 'Thomas George',
    representative_name: 'Thomas George',
    contactPhone: '+91 94471 00004',
    contact_phone: '+91 94471 00004',
    units: [
      { unitNumber: 'Unit I', unit_number: 'Unit I' },
      { unitNumber: 'Unit II', unit_number: 'Unit II' },
      { unitNumber: 'Unit III', unit_number: 'Unit III' },
      { unitNumber: 'Unit IV', unit_number: 'Unit IV' }
    ],
    families: [
      {
        familyCode: 'F-401',
        familyName: 'Chelakkal Family',
        houseName: 'Chelakkal House',
        unit: 'Unit I',
        address: 'M4-045, Medical College Junction, Kozhikode - 673008',
        phone: '+91 98470 40101',
        email: 'chelakkal@devagiriparish.com',
        members: [
          { firstName: 'Thomas', lastName: 'Chelakkal', nameMl: 'തോമസ് ചേലക്കൽ', baptismName: 'Thomas', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 40101' },
          { firstName: 'Celine', lastName: 'Chelakkal', nameMl: 'സെലീൻ ചേലക്കൽ', baptismName: 'Celine', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 40102' },
          { firstName: 'James', lastName: 'Chelakkal', nameMl: 'ജെയിംസ് ചേലക്കൽ', baptismName: 'James', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 40103' }
        ]
      },
      {
        familyCode: 'F-402',
        familyName: 'Mundackal Family',
        houseName: 'Mundackal House',
        unit: 'Unit II',
        address: 'M4-052, Campus Avenue, Medical College, Kozhikode - 673008',
        phone: '+91 98470 40201',
        email: 'mundackal@devagiriparish.com',
        members: [
          { firstName: 'Jose', lastName: 'Mundackal', nameMl: 'ജോസ് മുണ്ടയ്ക്കൽ', baptismName: 'Joseph', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 40201' },
          { firstName: 'Claramma', lastName: 'Mundackal', nameMl: 'ക്ലാരമ്മ മുണ്ടയ്ക്കൽ', baptismName: 'Clara', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 40202' },
          { firstName: 'Luke', lastName: 'Mundackal', nameMl: 'ലൂക്ക് മുണ്ടയ്ക്കൽ', baptismName: 'Luke', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 40203' },
          { firstName: 'Rita', lastName: 'Mundackal', nameMl: 'റീത്ത മുണ്ടയ്ക്കൽ', baptismName: 'Rita', gender: 'FEMALE', rel: 'Daughter', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 40204' }
        ]
      },
      {
        familyCode: 'F-403',
        familyName: 'Vazhappilly Family',
        houseName: 'Vazhappilly House',
        unit: 'Unit III',
        address: 'M4-060, St. Joseph Street, Kozhikode - 673008',
        phone: '+91 98470 40301',
        email: 'vazhappilly@devagiriparish.com',
        members: [
          { firstName: 'Tomy', lastName: 'Vazhappilly', nameMl: 'ടോമി വാഴപ്പിള്ളി', baptismName: 'Thomas', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 40301' },
          { firstName: 'Lissy', lastName: 'Vazhappilly', nameMl: 'ലിസി വാഴപ്പിള്ളി', baptismName: 'Lucy', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 40302' },
          { firstName: 'Martin', lastName: 'Vazhappilly', nameMl: 'മാർട്ടിൻ വാഴപ്പിള്ളി', baptismName: 'Martin', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 40303' }
        ]
      },
      {
        familyCode: 'F-404',
        familyName: 'Poovathur Family',
        houseName: 'Poovathur House',
        unit: 'Unit IV',
        address: 'M4-068, Medical College Bypass, Kozhikode - 673008',
        phone: '+91 98470 40401',
        email: 'poovathur@devagiriparish.com',
        members: [
          { firstName: 'Simon', lastName: 'Poovathur', nameMl: 'സൈമൺ പൂവത്തൂർ', baptismName: 'Simon', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 40401' },
          { firstName: 'Leelamma', lastName: 'Poovathur', nameMl: 'ലീലാമ്മ പൂവത്തൂർ', baptismName: 'Leela', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 40402' },
          { firstName: 'Dominic', lastName: 'Poovathur', nameMl: 'ഡൊമിനിക് പൂവത്തൂർ', baptismName: 'Dominic', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 40403' }
        ]
      }
    ]
  },
  {
    wardNumber: 5,
    ward_number: 5,
    wardName: 'St. LITTLE FLOWER WARD',
    ward_name: 'St. LITTLE FLOWER WARD, MAYANAD',
    area: 'MAYANAD',
    representativeName: 'Paulson Devassy',
    representative_name: 'Paulson Devassy',
    contactPhone: '+91 94471 00005',
    contact_phone: '+91 94471 00005',
    units: [
      { unitNumber: 'Unit I', unit_number: 'Unit I' },
      { unitNumber: 'Unit II', unit_number: 'Unit II' },
      { unitNumber: 'Unit III', unit_number: 'Unit III' }
    ],
    families: [
      {
        familyCode: 'F-501',
        familyName: 'Kizhakkel Family',
        houseName: 'Kizhakkel House',
        unit: 'Unit I',
        address: 'Y5-015, Mayanad Post Office Road, Kozhikode - 673008',
        phone: '+91 98470 50101',
        email: 'kizhakkel@devagiriparish.com',
        members: [
          { firstName: 'Xavier', lastName: 'Kizhakkel', nameMl: 'ഫ്രാൻസിസ് കിഴക്കേൽ', baptismName: 'Francis Xavier', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 50101' },
          { firstName: 'Anna', lastName: 'Kizhakkel', nameMl: 'അന്ന കിഴക്കേൽ', baptismName: 'Anna', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 50102' },
          { firstName: 'Leo', lastName: 'Kizhakkel', nameMl: 'ലിയോ കിഴക്കേൽ', baptismName: 'Leo', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 50103' }
        ]
      },
      {
        familyCode: 'F-502',
        familyName: 'Nedumkallel Family',
        houseName: 'Nedumkallel House',
        unit: 'Unit II',
        address: 'Y5-022, Little Flower Lane, Mayanad, Kozhikode - 673008',
        phone: '+91 98470 50201',
        email: 'nedumkallel@devagiriparish.com',
        members: [
          { firstName: 'George', lastName: 'Nedumkallel', nameMl: 'ജോർജ് നെടുംകല്ലേൽ', baptismName: 'George', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 50201' },
          { firstName: 'Pennamma', lastName: 'Nedumkallel', nameMl: 'പെണ്ണമ്മ നെടുംകല്ലേൽ', baptismName: 'Mary', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 50202' },
          { firstName: 'Michael', lastName: 'Nedumkallel', nameMl: 'മൈക്കിൾ നെടുംകല്ലേൽ', baptismName: 'Michael', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 50203' },
          { firstName: 'Sandra', lastName: 'Nedumkallel', nameMl: 'സാൻഡ്ര നെടുംകല്ലേൽ', baptismName: 'Sandra', gender: 'FEMALE', rel: 'Daughter', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 50204' }
        ]
      },
      {
        familyCode: 'F-503',
        familyName: 'Kavalam Family',
        houseName: 'Kavalam House',
        unit: 'Unit III',
        address: 'Y5-030, Mayanad Village, Kozhikode - 673008',
        phone: '+91 98470 50301',
        email: 'kavalam@devagiriparish.com',
        members: [
          { firstName: 'Joychan', lastName: 'Kavalam', nameMl: 'ജോയിച്ചൻ കാവാലം', baptismName: 'Joseph', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 50301' },
          { firstName: 'Molly', lastName: 'Kavalam', nameMl: 'മോളി കാവാലം', baptismName: 'Mary', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 50302' },
          { firstName: 'Alex', lastName: 'Kavalam', nameMl: 'അലക്സ് കാവാലം', baptismName: 'Alexander', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 50303' }
        ]
      }
    ]
  },
  {
    wardNumber: 6,
    ward_number: 6,
    wardName: 'MARYLAND WARD',
    ward_name: 'MARYLAND WARD, KOVOOR NORTH',
    area: 'KOVOOR NORTH',
    representativeName: 'Francis Xavier',
    representative_name: 'Francis Xavier',
    contactPhone: '+91 94471 00006',
    contact_phone: '+91 94471 00006',
    units: [
      { unitNumber: 'Unit I', unit_number: 'Unit I' },
      { unitNumber: 'Unit II', unit_number: 'Unit II' },
      { unitNumber: 'Unit III', unit_number: 'Unit III' }
    ],
    families: [
      {
        familyCode: 'F-601',
        familyName: 'Ambatt Family',
        houseName: 'Ambatt House',
        unit: 'Unit I',
        address: 'N6-101, Maryland Road, Kovoor North, Kozhikode - 673017',
        phone: '+91 98470 60101',
        email: 'ambatt@devagiriparish.com',
        members: [
          { firstName: 'Varghese', lastName: 'Ambatt', nameMl: 'വർഗീസ് അമ്പാട്ട്', baptismName: 'George', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 60101' },
          { firstName: 'Thresiamma', lastName: 'Ambatt', nameMl: 'ത്രേസ്യാമ്മ അമ്പാട്ട്', baptismName: 'Theresa', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 60102' },
          { firstName: 'Philip', lastName: 'Ambatt', nameMl: 'ഫിലിപ്പ് അമ്പാട്ട്', baptismName: 'Philip', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 60103' }
        ]
      },
      {
        familyCode: 'F-602',
        familyName: 'Vadakkel Family',
        houseName: 'Vadakkel House',
        unit: 'Unit II',
        address: 'N6-108, Kovoor North Avenue, Kozhikode - 673017',
        phone: '+91 98470 60201',
        email: 'vadakkel@devagiriparish.com',
        members: [
          { firstName: 'Emmanuel', lastName: 'Vadakkel', nameMl: 'ഇമ്മാനുവൽ വടക്കേൽ', baptismName: 'Emmanuel', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 60201' },
          { firstName: 'Mary', lastName: 'Vadakkel', nameMl: 'മേരി വടക്കേൽ', baptismName: 'Mary', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 60202' },
          { firstName: 'Joseph', lastName: 'Vadakkel', nameMl: 'ജോസഫ് വടക്കേൽ', baptismName: 'Joseph', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 60203' },
          { firstName: 'Catherine', lastName: 'Vadakkel', nameMl: 'കാതറിൻ വടക്കേൽ', baptismName: 'Catherine', gender: 'FEMALE', rel: 'Daughter', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 60204' }
        ]
      },
      {
        familyCode: 'F-603',
        familyName: 'Karakkat Family',
        houseName: 'Karakkat House',
        unit: 'Unit III',
        address: 'N6-115, St. Marys Lane, Kovoor North, Kozhikode - 673017',
        phone: '+91 98470 60301',
        email: 'karakkat@devagiriparish.com',
        members: [
          { firstName: 'Mathai', lastName: 'Karakkat', nameMl: 'മാത്യു കാരക്കാട്ട്', baptismName: 'Mathew', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 60301' },
          { firstName: 'Annamma', lastName: 'Karakkat', nameMl: 'അന്നമ്മ കാരക്കാട്ട്', baptismName: 'Anne', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 60302' },
          { firstName: 'Benjamin', lastName: 'Karakkat', nameMl: 'ബഞ്ചമിൻ കാരക്കാട്ട്', baptismName: 'Benjamin', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 60303' }
        ]
      }
    ]
  },
  {
    wardNumber: 7,
    ward_number: 7,
    wardName: 'St. MOTHER THERESA WARD',
    ward_name: 'St. MOTHER THERESA WARD, MUNDIKKALTHAZHAM',
    area: 'MUNDIKKALTHAZHAM',
    representativeName: 'Sebastian Joseph',
    representative_name: 'Sebastian Joseph',
    contactPhone: '+91 94471 00007',
    contact_phone: '+91 94471 00007',
    units: [
      { unitNumber: 'Unit I', unit_number: 'Unit I' },
      { unitNumber: 'Unit II', unit_number: 'Unit II' }
    ],
    families: [
      {
        familyCode: 'F-701',
        familyName: 'Cheriankal Family',
        houseName: 'Cheriankal House',
        unit: 'Unit I',
        address: 'T7-005, Mundikkalthazham Road, Kozhikode - 673019',
        phone: '+91 98470 70101',
        email: 'cheriankal@devagiriparish.com',
        members: [
          { firstName: 'Cherian', lastName: 'Cheriankal', nameMl: 'കുര്യൻ ചെറിയാൻകൽ', baptismName: 'Cyriac', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 70101' },
          { firstName: 'Alice', lastName: 'Cheriankal', nameMl: 'ആലീസ് ചെറിയാൻകൽ', baptismName: 'Alice', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 70102' },
          { firstName: 'Daniel', lastName: 'Cheriankal', nameMl: 'ഡാനിയേൽ ചെറിയാൻകൽ', baptismName: 'Daniel', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 70103' }
        ]
      },
      {
        familyCode: 'F-702',
        familyName: 'Kanjirathinkal Family',
        houseName: 'Kanjirathinkal House',
        unit: 'Unit II',
        address: 'T7-012, Mother Theresa Colony, Mundikkalthazham, Kozhikode - 673019',
        phone: '+91 98470 70201',
        email: 'kanjirathinkal@devagiriparish.com',
        members: [
          { firstName: 'Sebastian', lastName: 'Kanjirathinkal', nameMl: 'സെബസ്ത്യാനോസ് കഞ്ഞിരത്തിങ്കൽ', baptismName: 'Sebastian', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 70201' },
          { firstName: 'Pennamma', lastName: 'Kanjirathinkal', nameMl: 'പെണ്ണമ്മ കഞ്ഞിരത്തിങ്കൽ', baptismName: 'Mary', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 70202' },
          { firstName: 'Gabriel', lastName: 'Kanjirathinkal', nameMl: 'ഗബ്രിയേൽ കഞ്ഞിരത്തിങ്കൽ', baptismName: 'Gabriel', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 70203' },
          { firstName: 'Lucy', lastName: 'Kanjirathinkal', nameMl: 'ലൂസി കഞ്ഞിരത്തിങ്കൽ', baptismName: 'Lucy', gender: 'FEMALE', rel: 'Daughter', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 70204' }
        ]
      },
      {
        familyCode: 'F-703',
        familyName: 'Pynadath Family',
        houseName: 'Pynadath House',
        unit: 'Unit I',
        address: 'T7-020, Mundikkalthazham Bypass, Kozhikode - 673019',
        phone: '+91 98470 70301',
        email: 'pynadath@devagiriparish.com',
        members: [
          { firstName: 'Joseph', lastName: 'Pynadath', nameMl: 'ജോസഫ് പൈനാടത്ത്', baptismName: 'Joseph', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 70301' },
          { firstName: 'Philomena', lastName: 'Pynadath', nameMl: 'ഫിലോമിന പൈനാടത്ത്', baptismName: 'Philomena', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 70302' },
          { firstName: 'Samuel', lastName: 'Pynadath', nameMl: 'സാമുവൽ പൈനാടത്ത്', baptismName: 'Samuel', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 70303' }
        ]
      }
    ]
  },
  {
    wardNumber: 8,
    ward_number: 8,
    wardName: 'St. THOMAS WARD',
    ward_name: 'St. THOMAS WARD, VELLIPARAMBA',
    area: 'VELLIPARAMBA',
    representativeName: 'Mathew Philip',
    representative_name: 'Mathew Philip',
    contactPhone: '+91 94471 00008',
    contact_phone: '+91 94471 00008',
    units: [
      { unitNumber: 'Unit I', unit_number: 'Unit I' },
      { unitNumber: 'Unit II', unit_number: 'Unit II' },
      { unitNumber: 'Unit III', unit_number: 'Unit III' }
    ],
    families: [
      {
        familyCode: 'F-801',
        familyName: 'Kattakayam Family',
        houseName: 'Kattakayam House',
        unit: 'Unit I',
        address: 'V8-201, Velliparamba Junction, Kozhikode - 673008',
        phone: '+91 98470 80101',
        email: 'kattakayam@devagiriparish.com',
        members: [
          { firstName: 'Mathew', lastName: 'Kattakayam', nameMl: 'മാത്യു കട്ടക്കയം', baptismName: 'Mathew', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 80101' },
          { firstName: 'Thresiamma', lastName: 'Kattakayam', nameMl: 'ത്രേസ്യാമ്മ കട്ടക്കയം', baptismName: 'Theresa', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 80102' },
          { firstName: 'Justin', lastName: 'Kattakayam', nameMl: 'ജസ്റ്റിൻ കട്ടക്കയം', baptismName: 'Justin', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 80103' }
        ]
      },
      {
        familyCode: 'F-802',
        familyName: 'Meledath Family',
        houseName: 'Meledath House',
        unit: 'Unit II',
        address: 'V8-210, St. Thomas Avenue, Velliparamba, Kozhikode - 673008',
        phone: '+91 98470 80201',
        email: 'meledath@devagiriparish.com',
        members: [
          { firstName: 'George', lastName: 'Meledath', nameMl: 'ജോർജ് മേലേടത്ത്', baptismName: 'George', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 80201' },
          { firstName: 'Rosemary', lastName: 'Meledath', nameMl: 'റോസ്മേരി മേലേടത്ത്', baptismName: 'Rosemary', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 80202' },
          { firstName: 'Patrick', lastName: 'Meledath', nameMl: 'പാട്രിക് മേലേടത്ത്', baptismName: 'Patrick', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 80203' },
          { firstName: 'Julia', lastName: 'Meledath', nameMl: 'ജൂലിയ മേലേടത്ത്', baptismName: 'Julia', gender: 'FEMALE', rel: 'Daughter', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 80204' }
        ]
      },
      {
        familyCode: 'F-803',
        familyName: 'Vayanattil Family',
        houseName: 'Vayanattil House',
        unit: 'Unit III',
        address: 'V8-218, Velliparamba Road, Kozhikode - 673008',
        phone: '+91 98470 80301',
        email: 'vayanattil@devagiriparish.com',
        members: [
          { firstName: 'Thomas', lastName: 'Vayanattil', nameMl: 'തോമസ് വയനാട്ടിൽ', baptismName: 'Thomas', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 80301' },
          { firstName: 'Celine', lastName: 'Vayanattil', nameMl: 'സെലീൻ വയനാട്ടിൽ', baptismName: 'Celine', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 80302' },
          { firstName: 'Kevin', lastName: 'Vayanattil', nameMl: 'കെവിൻ വയനാട്ടിൽ', baptismName: 'Kevin', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 80303' }
        ]
      },
      {
        familyCode: 'F-804',
        familyName: 'Chakkalakal Family',
        houseName: 'Chakkalakal House',
        unit: 'Unit I',
        address: 'V8-225, Velliparamba Hill, Kozhikode - 673008',
        phone: '+91 98470 80401',
        email: 'chakkalakal@devagiriparish.com',
        members: [
          { firstName: 'Joseph', lastName: 'Chakkalakal', nameMl: 'ജോസഫ് ചക്കലാക്കൽ', baptismName: 'Joseph', gender: 'MALE', rel: 'Head', isHead: true, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 80401' },
          { firstName: 'Annamma', lastName: 'Chakkalakal', nameMl: 'അന്നമ്മ ചക്കലാക്കൽ', baptismName: 'Anne', gender: 'FEMALE', rel: 'Spouse', isHead: false, sacraments: ['baptism', 'communion', 'confirmation', 'marriage'], phone: '+91 98470 80402' },
          { firstName: 'Mark', lastName: 'Chakkalakal', nameMl: 'മാർക്ക് ചക്കലാക്കൽ', baptismName: 'Mark', gender: 'MALE', rel: 'Son', isHead: false, sacraments: ['baptism', 'communion'], phone: '+91 98470 80403' }
        ]
      }
    ]
  }
];

async function restoreWardsAndFamilies() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected successfully!');

    console.log('Wiping existing Wards, Families, and Parishioners collections...');
    await Promise.all([
      Ward.deleteMany({}),
      Family.deleteMany({}),
      Parishioner.deleteMany({})
    ]);

    let totalCreatedWards = 0;
    let totalCreatedFamilies = 0;
    let totalCreatedMembers = 0;

    for (const wData of officialWardsData) {
      console.log(`Creating Ward #${wData.wardNumber}: ${wData.ward_name}...`);

      const wardDoc = await Ward.create({
        wardNumber: wData.wardNumber,
        ward_number: wData.ward_number,
        wardName: wData.wardName,
        ward_name: wData.ward_name,
        area: wData.area,
        units: wData.units,
        total_units: wData.units.length,
        representativeName: wData.representativeName,
        representative_name: wData.representative_name,
        contactPhone: wData.contactPhone,
        contact_phone: wData.contact_phone,
        totalFamilies: wData.families.length
      });

      totalCreatedWards++;

      for (const fData of wData.families) {
        const headMemberSeed = fData.members[0];
        const headFullName = `${headMemberSeed.firstName} ${headMemberSeed.lastName}`;

        const familyDoc = await Family.create({
          house_name: fData.houseName,
          family_name: fData.familyName,
          family_code: fData.familyCode,
          ward: wardDoc._id,
          ward_id: wardDoc._id,
          wardId: wardDoc._id,
          wardNumber: wardDoc.wardNumber,
          ward_number: wardDoc.ward_number,
          wardName: wardDoc.wardName,
          ward_name: wardDoc.ward_name,
          unit: fData.unit,
          unit_number: fData.unit,
          address: fData.address,
          home_address: fData.address,
          contact_number: fData.phone,
          email: fData.email,
          head_of_family: headFullName,
          family_photo_url: null
        });

        totalCreatedFamilies++;

        let createdHeadDoc = null;

        for (const mData of fData.members) {
          const memberDoc = await Parishioner.create({
            family: familyDoc._id,
            family_id: familyDoc._id,
            first_name: mData.firstName,
            last_name: mData.lastName,
            malayalam_name: mData.nameMl,
            baptism_name: mData.baptismName,
            gender: mData.gender,
            phone_number: mData.phone,
            email: fData.email,
            status: 'active',
            is_active: true,
            is_head_of_household: mData.isHead,
            relation_to_head: mData.rel,
            relationship_role: mData.rel,
            ward_id: wardDoc._id,
            wardId: wardDoc._id,
            ward_number: wardDoc.wardNumber,
            wardNumber: wardDoc.wardNumber,
            unit: fData.unit,
            unit_number: fData.unit,
            sacraments: mData.sacraments
          });

          totalCreatedMembers++;

          if (mData.isHead) {
            createdHeadDoc = memberDoc;
          }
        }

        if (createdHeadDoc) {
          familyDoc.head_of_family = `${createdHeadDoc.first_name} ${createdHeadDoc.last_name}`;
          await familyDoc.save();
        }
      }

      // Update ward metrics
      const familyCountForWard = await Family.countDocuments({ ward_id: wardDoc._id });
      wardDoc.totalFamilies = familyCountForWard;
      await wardDoc.save();
    }

    console.log('\n==========================================');
    console.log(`✅ RESTORATION SUCCESSFUL!`);
    console.log(`- Created Wards: ${totalCreatedWards}`);
    console.log(`- Created Families: ${totalCreatedFamilies}`);
    console.log(`- Created Parishioners: ${totalCreatedMembers}`);
    console.log('==========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Restoration failed:', err);
    process.exit(1);
  }
}

restoreWardsAndFamilies();
