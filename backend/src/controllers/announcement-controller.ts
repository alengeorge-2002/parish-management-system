import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { sendPushToAllParishioners } from '../utils/pushNotifier';

const parseId = (val: any): number | null => {
  if (!val) return null;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? null : num;
};

/**
 * Fetches all active announcements sorted by date (newest first).
 */
export const getAllAnnouncements = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT *, id as _id FROM announcements
       WHERE is_active = true OR is_active IS NULL
       ORDER BY COALESCE(announcement_date, created_at) DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Creates a new announcement record and triggers a push notification.
 */
export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, description, imageUrl, poster_url, priority, expiry_date, is_active, isActive, status } = req.body;
    const annTitle = title || req.body.heading || req.body.name;
    const annContent = content || description || req.body.message || req.body.text;
    if (!annTitle || !annContent) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const activeFlag = is_active !== undefined ? Boolean(is_active) : (isActive !== undefined ? Boolean(isActive) : (status ? status === 'active' : true));
    const img = imageUrl || poster_url || req.body.posterImage || null;
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO announcements (
         title, content, image_url, poster_url, priority, is_active, announcement_date, expiry_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *, id as _id`,
      [annTitle.trim(), annContent.trim(), img, img, priority || 'medium', activeFlag, now, expiry_date || null]
    );

    const announcement = result.rows[0];

    // Trigger Web Push to all subscribed parishioners asynchronously
    sendPushToAllParishioners({
      title: `📢 Parish Notice: ${annTitle}`,
      body: annContent.length > 120 ? `${annContent.substring(0, 117)}...` : annContent,
      url: '/announcements',
      tag: 'parish-announcement',
    }).catch((err) => console.error('[PushNotifier] Announcement push error:', err));

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Updates an existing announcement record.
 */
export const updateAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Valid id required' });
      return;
    }

    const { title, content, imageUrl, poster_url, priority, expiry_date } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const img = imageUrl || poster_url || null;
    const result = await pool.query(
      `UPDATE announcements SET
         title = $1, content = $2, image_url = $3, poster_url = $4,
         priority = $5, expiry_date = $6
       WHERE id = $7
       RETURNING *, id as _id`,
      [title.trim(), content.trim(), img, img, priority || 'medium', expiry_date || null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }

    const updated = result.rows[0];

    sendPushToAllParishioners({
      title: `📢 Updated Notice: ${title}`,
      body: content.length > 120 ? `${content.substring(0, 117)}...` : content,
      url: '/announcements',
      tag: 'parish-announcement',
    }).catch((err) => console.error('[PushNotifier] Announcement update push error:', err));

    res.json(updated);
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Deletes an announcement record by ID.
 */
export const deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Valid id required' });
      return;
    }

    const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
