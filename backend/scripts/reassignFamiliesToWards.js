const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Ward = require('../models/Ward');
const Family = require('../models/Family');
const Parishioner = require('../models/Parishioner');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devagiri_parish_db';

const AUTHENTIC_HOUSES = [
  "Thekkedathu House", "Kochupurackal House", "Mundackal House", "Edathil House",
  "Manjaly House", "Nedumkallel House", "Chelakkal House", "Puthur House",
  "Kavalam House", "Ambatt House", "Vazhappilly House", "Karottu House",
  "Palathinkal House", "Kizhakkel House", "Thundiyil House", "Poovathur House",
  "Kalapurackal House", "Vadakkel House", "Karippai House", "Manjooran House",
  "Cherian House", "Painadath House", "Vettathu House", "Nangani House",
  "Chakkalakal House", "Pynadath House", "Perappadan House", "Kannethu House",
  "Menachery House", "Illimoottil House", "Kattakayam House", "Nellissery House",
  "Vadakkumchery House", "Arambankudiyil House", "Chennangadan House", "Kulangarath House",
  "Paredom House", "Padamadan House", "Pullokaran House", "Variath House"
];

const AUTHENTIC_HEADS = [
  "Joseph Thekkedathu", "Antony Kochupurackal", "Jose Mundackal", "Rosamma Edathil",
  "Kurian Manjaly", "George Nedumkallel", "Thomas Chelakkal", "Antony Puthur",
  "Joychan Kavalam", "Varghese Ambatt", "Lissy Vazhappilly", "Paulose Karottu",
  "Devassy Palathinkal", "Anna Kizhakkel", "Elias Thundiyil", "Simon Poovathur",
  "Dr. Mathew Kalapurackal", "Mary Vadakkel", "Kunjachan Karippai", "Babu Manjooran",
  "Mathew Cherian", "Francis Painadath", "Xavier Vettathu", "Sebastian Nangani",
  "Dominic Chakkalakal", "Jacob Pynadath", "Thomas Perappadan", "Philip Kannethu",
  "Joseph Menachery", "Varghese Illimoottil", "Mathai Kattakayam", "Jose Nellissery",
  "Fr. Vadakkumchery", "Paul Arambankudiyil", "George Chennangadan", "Antony Kulangarath",
  "Johnny Paredom", "Peter Padamadan", "Joy Pullokaran", "Tomy Variath"
];

async function reassign() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for family reassignment...');

    // 1. Fetch all active wards sorted by wardNumber ascending
    const wards = await Ward.find().sort({ wardNumber: 1, ward_number: 1 });
    console.log(`Found ${wards.length} wards in database.`);

    if (wards.length === 0) {
      console.error('❌ No wards found. Please seed wards first!');
      process.exit(1);
    }

    // 2. Fetch existing families
    let families = await Family.find();
    console.log(`Currently found ${families.length} existing families.`);

    const requiredFamiliesCount = wards.length * 5; // 8 wards * 5 = 40 families

    if (families.length < requiredFamiliesCount) {
      const deficit = requiredFamiliesCount - families.length;
      console.log(`Generating ${deficit} additional authentic family records...`);

      const newFamiliesToCreate = [];
      for (let i = 0; i < deficit; i++) {
        const index = (families.length + i) % AUTHENTIC_HOUSES.length;
        const houseName = AUTHENTIC_HOUSES[index];
        const headName = AUTHENTIC_HEADS[index];
        const familyCode = `F-${100 + families.length + i + 1}`;
        const phone = `+91 98470 ${20000 + families.length + i}`;

        newFamiliesToCreate.push({
          house_name: houseName,
          family_name: houseName.replace(' House', ''),
          family_code: familyCode,
          head_of_family: headName,
          contact_number: phone,
          address: `${houseName}, Devagiri Parish, Calicut`,
          home_address: `${houseName}, Devagiri Parish, Calicut`,
        });
      }

      await Family.insertMany(newFamiliesToCreate);
      families = await Family.find();
      console.log(`Total families after generation: ${families.length}`);
    }

    // 3. Assign 5 families per ward
    let familyIndex = 0;

    for (let i = 0; i < wards.length; i++) {
      const ward = wards[i];
      const wardNum = ward.wardNumber || ward.ward_number || (i + 1);
      const wardNameEn = ward.wardName || ward.ward_name || `Ward ${wardNum}`;
      const wardNameMl = ward.ward_name || ward.wardName || `Ward ${wardNum}`;
      const availableUnits = Array.isArray(ward.units) && ward.units.length > 0
        ? ward.units
        : [{ unitNumber: 'Unit I' }, { unitNumber: 'Unit II' }];

      console.log(`\n--- Assigning 5 families to Ward #${wardNum}: ${wardNameEn} ---`);

      for (let f = 0; f < 5; f++) {
        if (familyIndex >= families.length) break;

        const fam = families[familyIndex];
        const unitObj = availableUnits[f % availableUnits.length];
        const unitLabel = typeof unitObj === 'string'
          ? unitObj
          : (unitObj.unitNumber || unitObj.unit_number || `Unit ${(f % availableUnits.length) + 1}`);

        // Update family in DB
        fam.ward = ward._id;
        fam.ward_id = ward._id;
        fam.wardId = ward._id;
        fam.wardNumber = wardNum;
        fam.ward_number = wardNum;
        fam.wardName = wardNameEn;
        fam.ward_name = wardNameMl;
        fam.unit = unitLabel;
        fam.unit_number = unitLabel;
        await fam.save();

        // Update any associated members
        await Parishioner.updateMany(
          { $or: [{ family: fam._id }, { family_id: fam._id }] },
          {
            $set: {
              ward_id: ward._id,
              wardId: ward._id,
              wardNumber: wardNum,
              ward_number: wardNum,
            }
          }
        );

        console.log(`  ✅ Family #${f + 1} (${fam.house_name}) -> Ward #${wardNum} (${wardNameEn}) | ${unitLabel}`);
        familyIndex++;
      }

      // Update totalFamilies on Ward document
      ward.totalFamilies = 5;
      ward.total_families = 5;
      await ward.save();
    }

    console.log('\n=============================================================');
    console.log('✅ Successfully reassigned families across all 8 wards with valid units!');
    console.log('=============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reassignment Error:', err);
    process.exit(1);
  }
}

reassign();
