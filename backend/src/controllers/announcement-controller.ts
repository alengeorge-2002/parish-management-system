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
    let rows: any[] = [];
    try {
      const result = await pool.query(
        `SELECT *, id as _id FROM announcements
         WHERE is_active = true OR is_active IS NULL
         ORDER BY COALESCE(announcement_date, created_at) DESC`
      );
      rows = result.rows;
    } catch (colErr: any) {
      console.warn('[Announcements] Primary query failed, falling back to simple query:', colErr?.message);
      const fallbackResult = await pool.query(
        `SELECT *, id as _id FROM announcements
         ORDER BY id DESC`
      );
      rows = fallbackResult.rows;
    }

    const mapped = rows.map((r: any) => ({
      ...r,
      id: r.id,
      _id: r.id,
      imageUrl: r.image_url || r.poster_url || '',
      image_url: r.image_url || r.poster_url || '',
      poster_url: r.poster_url || r.image_url || '',
      announcementDate: r.announcement_date || r.created_at,
      announcement_date: r.announcement_date || r.created_at,
      createdAt: r.created_at,
      created_at: r.created_at,
      isActive: r.is_active !== false,
      is_active: r.is_active !== false,
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch announcements error:', error);
    res.status(200).json([]); // Always return 200 with an array to prevent client crashes
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

    let announcement: any;
    try {
      const result = await pool.query(
        `INSERT INTO announcements (
           title, content, image_url, poster_url, priority, is_active, announcement_date, expiry_date
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *, id as _id`,
        [annTitle.trim(), annContent.trim(), img, img, priority || 'medium', activeFlag, now, expiry_date || null]
      );
      announcement = result.rows[0];
    } catch (insertErr: any) {
      console.warn('[Announcements] Primary insert failed, falling back to core columns:', insertErr?.message);
      const fallbackResult = await pool.query(
        `INSERT INTO announcements (
           title, content, image_url, priority
         ) VALUES ($1, $2, $3, $4)
         RETURNING *, id as _id`,
        [annTitle.trim(), annContent.trim(), img, priority || 'medium']
      );
      announcement = fallbackResult.rows[0];
    }

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

    const { title, content, imageUrl, poster_url, priority, expiry_date, is_active, isActive } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const img = imageUrl || poster_url || null;
    const activeFlag = is_active !== undefined ? Boolean(is_active) : (isActive !== undefined ? Boolean(isActive) : undefined);

    let updated: any;
    try {
      const result = await pool.query(
        `UPDATE announcements SET
           title = $1, content = $2, image_url = $3, poster_url = $4,
           priority = $5, expiry_date = $6,
           is_active = COALESCE($7, is_active)
         WHERE id = $8
         RETURNING *, id as _id`,
        [title.trim(), content.trim(), img, img, priority || 'medium', expiry_date || null, activeFlag, id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Announcement not found' });
        return;
      }
      updated = result.rows[0];
    } catch (updateErr: any) {
      console.warn('[Announcements] Primary update failed, falling back to core columns:', updateErr?.message);
      const fallbackResult = await pool.query(
        `UPDATE announcements SET
           title = $1, content = $2, image_url = $3, priority = $4
         WHERE id = $5
         RETURNING *, id as _id`,
        [title.trim(), content.trim(), img, priority || 'medium', id]
      );
      if (fallbackResult.rows.length === 0) {
        res.status(404).json({ error: 'Announcement not found' });
        return;
      }
      updated = fallbackResult.rows[0];
    }

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
