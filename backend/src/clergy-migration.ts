import { ReligiousHouse, Clergy } from './models';

/**
 * Migration and seeding script for the clergy_directory table/collection.
 * Ensures initial religious houses and clergy records exist in MongoDB.
 */
export const runClergyMigration = async (): Promise<void> => {
  console.log('Starting clergy directory Mongoose migration & seeding...');
  try {
    const seedHouses = [
      { name: "St. Joseph's Monastery", category_type: 'men' },
      { name: 'Carmelite Convent', category_type: 'women' },
      { name: 'Mercy Convent', category_type: 'women' },
    ];

    const houseDocs: Record<string, any> = {};

    for (const h of seedHouses) {
      let house = await ReligiousHouse.findOne({ name: h.name });
      if (!house) {
        house = await ReligiousHouse.create(h);
        console.log(`Seeded religious house: ${h.name}`);
      }
      houseDocs[h.name] = house._id;
    }

    const seedClergy = [
      {
        name: 'Rev. Fr. Joseph Mathew',
        role_type: 'parish-priest',
        role: 'parish-priest',
        designation: 'Vicar',
        address: null,
        email: 'pp.stjosephdevagiri@gmail.com',
        phone_number: '+91 98450 00001',
        blood_group: 'O+',
        avatar_url: null,
        house_id: null,
      },
      {
        name: 'Rev. Fr. George Varghese',
        role_type: 'parish-priest',
        role: 'parish-priest',
        designation: 'Associate Pastor',
        address: null,
        email: 'assoc.stjosephdevagiri@gmail.com',
        phone_number: '+91 98450 00002',
        blood_group: 'O+',
        avatar_url: null,
        house_id: null,
      },
      {
        name: 'Sr. Anitha Thomas',
        role_type: 'sister',
        role: 'sister',
        designation: 'School Principal',
        address: 'CMC',
        email: null,
        phone_number: '+91 98450 00003',
        blood_group: 'O+',
        avatar_url: null,
        house_id: houseDocs['Carmelite Convent'] || null,
      },
      {
        name: 'Sr. Mary Joseph',
        role_type: 'sister',
        role: 'sister',
        designation: 'Social Service Wing',
        address: 'CMI',
        email: null,
        phone_number: '+91 98450 00004',
        blood_group: 'O+',
        avatar_url: null,
        house_id: houseDocs['Mercy Convent'] || null,
      },
    ];

    for (const item of seedClergy) {
      const existing = await Clergy.findOne({ name: item.name });
      if (!existing) {
        await Clergy.create(item);
        console.log(`Seeded clergy record: ${item.name}`);
      }
    }
    console.log('Clergy directory Mongoose migration finished successfully.');
  } catch (err) {
    console.error('Error running clergy directory database migration:', err);
  }
};
