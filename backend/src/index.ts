import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { Announcement, Event } from './models';
import { runClergyMigration } from './clergy-migration';
import { runMinistryMigration } from './ministry-migration';
import { runParishCouncilMigration } from './parish-council-migration';
import { runGeneralDbMigration } from './db-migration';

const port = process.env.PORT || 5000;

// Auto-initialize MongoDB connection and collections
const autoInitializeDb = async () => {
  try {
    await connectDB();

    // Announcements initialization & validation
    const annCount = await Announcement.countDocuments();
    if (annCount === 0) {
      await Announcement.create({
        title: 'Welcome to St. Joseph Devagiri Parish',
        content: 'We welcome all parishioners to join our weekend mass services and community gatherings.',
        priority: 'medium',
      });
      console.log('Database auto-initialization: seeded default announcement.');
    }

    // Feasts & Events initialization & validation
    const feastsCount = await Event.countDocuments();
    if (feastsCount === 0) {
      await Event.insertMany([
        {
          title: 'Sacred Heart of Jesus — Novena Begins',
          title_en: 'Sacred Heart of Jesus — Novena Begins',
          event_date: '2026-06-07',
          target_date: '2026-06-07',
          mass_time: '6:00 AM Daily',
          type_badge: 'Novena',
          location: 'Main Sanctuary',
          description: 'Nine days of devotion to the Sacred Heart of Jesus. All are welcome to participate in this powerful novena.',
          description_en: 'Nine days of devotion to the Sacred Heart of Jesus. All are welcome to participate in this powerful novena.',
        },
        {
          title: 'Feast of St Anthony',
          title_en: 'Feast of St Anthony',
          event_date: '2026-06-13',
          target_date: '2026-06-13',
          mass_time: '6:00 AM & 7:00 AM & 6:00 PM',
          type_badge: 'Feast',
          location: 'Main Sanctuary',
          description: 'Patron Saint Feast of our community with solemn holy mass and distribution of bread.',
          description_en: 'Patron Saint Feast of our community with solemn holy mass and distribution of bread.',
        },
        {
          title: 'Corpus Christi Procession',
          title_en: 'Corpus Christi Procession',
          event_date: '2026-06-14',
          target_date: '2026-06-14',
          mass_time: '6:30 PM',
          type_badge: 'Feast',
          location: 'Main Sanctuary',
          description: 'Solemn Procession around the parish grounds immediately following the Solemn High Mass.',
          description_en: 'Solemn Procession around the parish grounds immediately following the Solemn High Mass.',
        },
        {
          title: 'Youth Fellowship',
          title_en: 'Youth Fellowship',
          event_date: '2026-06-22',
          target_date: '2026-06-22',
          mass_time: '6:30 PM',
          type_badge: 'Event',
          location: 'Parish Hall',
          description: 'Praise, worship, and fellowship for the teenagers and youth of our parish.',
          description_en: 'Praise, worship, and fellowship for the teenagers and youth of our parish.',
        },
        {
          title: 'Feast of Sts. Peter & Paul',
          title_en: 'Feast of Sts. Peter & Paul',
          event_date: '2026-06-29',
          target_date: '2026-06-29',
          mass_time: '06:00 AM, 07:00 AM',
          type_badge: 'Feast',
          location: 'Main Sanctuary',
          description: 'Solemn liturgy celebrating the life and martyrdom of the Apostles Peter and Paul.',
          description_en: 'Solemn liturgy celebrating the life and martyrdom of the Apostles Peter and Paul.',
        },
      ]);
      console.log('Database auto-initialization: seeded "events/feasts" collection with June 2026 events.');
    }

    // Run general database migration & seeding
    await runGeneralDbMigration();
    // Clergy directory migration and seeding validation
    await runClergyMigration();
    // Ministry database migration and seeding validation
    await runMinistryMigration();
    // Parish council database migration and seeding validation
    await runParishCouncilMigration();
  } catch (err) {
    console.warn('Database auto-initialization error:', err);
  }
};

autoInitializeDb();

// Wrap app.listen conditional check for local development vs serverless execution
if (process.env.NODE_ENV !== 'production' || !process.env.AWS_EXECUTION_ENV) {
  app.listen(port, () => {
    console.log(`Local development server running on port ${port}`);
  });
}

export default app;
