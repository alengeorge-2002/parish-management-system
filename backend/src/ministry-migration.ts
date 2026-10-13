import { Organization, Parishioner } from './models';

/**
 * Migration and seeding script for ministries and ministry members in MongoDB.
 */
export const runMinistryMigration = async (): Promise<void> => {
  console.log('Starting ministry Mongoose migration & seeding...');
  try {
    const checkCount = await Organization.countDocuments({ category: 'ministry' });
    if (checkCount === 0) {
      const defaultMinistries = [
        {
          title: 'Altar Servers',
          name_en: 'Altar Servers',
          category: 'ministry',
          description: 'Assisting the priests at the altar during Holy Mass and other liturgical services.',
          icon_symbol: 'altar-servers',
          members: [],
        },
        {
          title: 'Choir',
          name_en: 'Choir',
          category: 'ministry',
          description: 'Leading the congregation in liturgical music and praise.',
          icon_symbol: 'choir',
          members: [],
        },
        {
          title: 'Catechists',
          name_en: 'Catechists',
          category: 'ministry',
          description: 'Providing faith education and sacramental preparation for children.',
          icon_symbol: 'catechists',
          members: [],
        },
        {
          title: 'Youth Association',
          name_en: 'Youth Association',
          category: 'ministry',
          description: 'Fostering fellowship, spiritual growth, and service among young people.',
          icon_symbol: 'youth-association',
          members: [],
        },
      ];

      for (const m of defaultMinistries) {
        await Organization.create(m);
      }
      console.log('Seeded default ministries in MongoDB.');
    }

    // Seed default ministry members if empty
    const members = await Parishioner.find();
    if (members.length > 0) {
      const altar = await Organization.findOne({ title: 'Altar Servers' });
      const choir = await Organization.findOne({ title: 'Choir' });
      const catechists = await Organization.findOne({ title: 'Catechists' });
      const youth = await Organization.findOne({ title: 'Youth Association' });

      if (altar && altar.members.length === 0) {
        const shilpa = members.find(m => m.first_name === 'Shilpa');
        const richard = members.find(m => m.first_name === 'Richard');
        const sandra = members.find(m => m.first_name === 'Sandra');

        if (shilpa) altar.members.push({ parishioner: shilpa._id as any, member_id: shilpa._id as any, role_title: 'Leader', role: 'Leader', display_order: 1 });
        if (richard) altar.members.push({ parishioner: richard._id as any, member_id: richard._id as any, role_title: 'Member', role: 'Member', display_order: 2 });
        if (sandra) altar.members.push({ parishioner: sandra._id as any, member_id: sandra._id as any, role_title: 'Member', role: 'Member', display_order: 3 });
        await altar.save();
      }

      if (choir && choir.members.length === 0) {
        const sophia = members.find(m => m.first_name === 'Sophia');
        const shilpa = members.find(m => m.first_name === 'Shilpa');

        if (sophia) choir.members.push({ parishioner: sophia._id as any, member_id: sophia._id as any, role_title: 'Choir Director', role: 'Choir Director', display_order: 1 });
        if (shilpa) choir.members.push({ parishioner: shilpa._id as any, member_id: shilpa._id as any, role_title: 'Soprano Singer', role: 'Soprano Singer', display_order: 2 });
        await choir.save();
      }

      if (catechists && catechists.members.length === 0) {
        const sophia = members.find(m => m.first_name === 'Sophia');
        if (sophia) catechists.members.push({ parishioner: sophia._id as any, member_id: sophia._id as any, role_title: 'Teacher', role: 'Teacher', display_order: 1 });
        await catechists.save();
      }

      if (youth && youth.members.length === 0) {
        const shilpa = members.find(m => m.first_name === 'Shilpa');
        const richard = members.find(m => m.first_name === 'Richard');

        if (shilpa) youth.members.push({ parishioner: shilpa._id as any, member_id: shilpa._id as any, role_title: 'President', role: 'President', display_order: 1 });
        if (richard) youth.members.push({ parishioner: richard._id as any, member_id: richard._id as any, role_title: 'Secretary', role: 'Secretary', display_order: 2 });
        await youth.save();
      }
    }
    console.log('Ministry Mongoose migration completed successfully.');
  } catch (err) {
    console.error('Error running ministry database migration:', err);
  }
};
