import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { sendPushToAllParishioners } from '../utils/pushNotifier';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

/**
 * Fetches all feasts sorted by event date (ascending).
 */
export const getAllFeasts = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT *, id as _id FROM events ORDER BY event_date ASC, created_at ASC`
    );
    res.json(result.rows);
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

    const result = await pool.query(
      `INSERT INTO events (
         title, title_en, title_ml, event_date, target_date,
         mass_time, type_badge, location, description, description_en, description_ml
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *, id as _id`,
      [
        eventTitle.trim(),
        (title_en || eventTitle).trim(),
        title_ml || '',
        dateVal,
        dateVal,
        massTime || '6:00 AM',
        typeBadge || 'Feast',
        location || 'Main Sanctuary',
        description || description_en || null,
        description_en || description || '',
        description_ml || ''
      ]
    );

    const event = result.rows[0];

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
    const result = await pool.query(
      `SELECT *, id as _id FROM events ORDER BY event_date ASC, target_date ASC, created_at ASC`
    );
    const mapped = result.rows.map((row: any) => {
      const targetDateStr = String(row.target_date || row.event_date || '').split('T')[0];
      return {
        ...row,
        id: String(row.id),
        _id: String(row.id),
        target_date: targetDateStr,
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
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Valid id required' });
      return;
    }

    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
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

    const result = await pool.query(
      `SELECT *, id as _id FROM events
       WHERE target_date = $1 OR event_date = $1
       ORDER BY created_at ASC`,
      [todayStr]
    );
    const todayList = result.rows;

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
