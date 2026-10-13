import { Request, Response, NextFunction } from 'express';
import { Event } from '../models';
import { sendPushToAllParishioners } from '../utils/pushNotifier';

/**
 * Fetches all feasts sorted by event date (ascending).
 */
export const getAllFeasts = async (_req: Request, res: Response) => {
  try {
    const list = await Event.find().sort({ event_date: 1, created_at: 1 });
    res.json(list);
  } catch (error) {
    console.error('Fetch feasts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Creates a new feast/event record and triggers a push notification.
 */
export const createFeast = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, title_en, eventDate, target_date, massTime, typeBadge, location, description, description_en, title_ml, description_ml } = req.body;
    
    const eventTitle = title || title_en;
    const dateVal = eventDate || target_date;

    if (!eventTitle || !dateVal) {
      res.status(400).json({ error: 'Title and eventDate/target_date are required fields' });
      return;
    }

    const event = await Event.create({
      title: eventTitle,
      title_en: title_en || eventTitle,
      title_ml: title_ml || '',
      event_date: dateVal,
      target_date: dateVal,
      mass_time: massTime || '6:00 AM',
      type_badge: typeBadge || 'Feast',
      location: location || 'Main Sanctuary',
      description: description || description_en || null,
      description_en: description_en || description || '',
      description_ml: description_ml || '',
    });

    // Trigger Web Push to all subscribed parishioners
    sendPushToAllParishioners({
      title: `✝️ Feast Day: ${eventTitle}`,
      body: `Scheduled for ${dateVal}. ${location ? `Location: ${location}` : ''}`,
      url: '/feasts',
      tag: 'parish-feast',
    }).catch((err) => console.error('[PushNotifier] Feast push error:', err));

    res.status(201).json(event);
  } catch (error) {
    console.error('Create feast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Fetches all events formatted for bilingual calendar integration.
 */
export const getAllEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const list = await Event.find().sort({ event_date: 1, target_date: 1, created_at: 1 });
    const mapped = list.map((item: any) => {
      const row = item.toObject ? item.toObject() : item;
      let targetDateStr = '';
      const rawDate = row.target_date || row.event_date;
      if (rawDate) {
        try {
          if (rawDate instanceof Date) {
            const year = rawDate.getFullYear();
            const month = (rawDate.getMonth() + 1).toString().padStart(2, '0');
            const day = rawDate.getDate().toString().padStart(2, '0');
            targetDateStr = `${year}-${month}-${day}`;
          } else {
            targetDateStr = String(rawDate).split('T')[0];
          }
        } catch (_) {
          targetDateStr = String(rawDate).split('T')[0];
        }
      }
      return {
        ...row,
        id: row._id ? row._id.toString() : row.id,
        target_date: targetDateStr || rawDate,
        title_en: row.title_en || row.title,
        title_ml: row.title_ml || '',
        description_en: row.description_en || row.description || '',
        description_ml: row.description_ml || '',
      };
    });
    res.json(mapped);
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Deletes a feast record by ID.
 */
export const deleteFeast = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Event.findByIdAndDelete(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Feast not found' });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete feast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Fetches today's calendar events & mass timings for home screen banner.
 */
export const getTodayEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const startOfDay = new Date(year, today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(year, today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const todayList = await Event.find({
      $or: [
        { target_date: todayStr },
        { event_date: todayStr },
        { target_date: { $gte: startOfDay, $lte: endOfDay } },
        { event_date: { $gte: startOfDay, $lte: endOfDay } },
      ],
    }).sort({ created_at: 1 });

    const massTimings = todayList
      .map((item: any) => item.mass_time)
      .filter((t: string) => Boolean(t && t.trim()));

    const formattedMassTimes = massTimings.length > 0
      ? massTimings.join(' & ')
      : 'രാവിലെ 7:00 & 10:00';

    const mainFeast = todayList[0] || null;

    res.json({
      date: todayStr,
      events: todayList,
      massTimings: massTimings.length > 0
        ? massTimings.map((t: string) => ({ time: t, language: 'Malayalam' }))
        : [{ time: '7:00 AM & 10:00 AM', language: 'Malayalam' }],
      time: formattedMassTimes,
      mass_time: formattedMassTimes,
      todayFeast: mainFeast
        ? {
            title_en: mainFeast.title_en || mainFeast.title,
            title_ml: mainFeast.title_ml || '',
            location: mainFeast.location || 'Main Sanctuary',
          }
        : null,
    });
  } catch (error) {
    console.error('Fetch today events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

