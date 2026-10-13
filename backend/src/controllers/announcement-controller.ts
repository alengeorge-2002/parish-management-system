import { Request, Response, NextFunction } from 'express';
import { Announcement } from '../models';
import { sendPushToAllParishioners } from '../utils/pushNotifier';

/**
 * Fetches all announcements sorted by creation date (newest first).
 */
export const getAllAnnouncements = async (_req: Request, res: Response) => {
  try {
    const list = await Announcement.find({
      $or: [
        { is_active: true },
        { is_active: { $exists: false } },
        { isActive: true },
        { isActive: { $exists: false } },
        { status: 'active' },
        { status: { $exists: false } },
      ],
    }).sort({ created_at: -1, createdAt: -1, date: -1, announcement_date: -1 });
    res.json(list);
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

    const activeFlag = is_active !== undefined ? is_active : (isActive !== undefined ? isActive : (status ? status === 'active' : true));
    const img = imageUrl || poster_url || req.body.posterImage || null;
    const now = new Date();
    const announcement = await Announcement.create({
      title: annTitle,
      content: annContent,
      image_url: img,
      poster_url: img,
      priority: priority || 'medium',
      is_active: activeFlag,
      announcement_date: now,
      created_at: now,
      expiry_date: expiry_date || null,
    });

    // Trigger Web Push to all subscribed parishioners asynchronously
    sendPushToAllParishioners({
      title: `📢 Parish Notice: ${title}`,
      body: content.length > 120 ? `${content.substring(0, 117)}...` : content,
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
    const { id } = req.params;
    const { title, content, imageUrl, poster_url, priority, expiry_date } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const img = imageUrl || poster_url || null;
    const updated = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        content,
        image_url: img,
        poster_url: img,
        priority: priority || 'medium',
        expiry_date: expiry_date || null,
      },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
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
    const { id } = req.params;
    const deleted = await Announcement.findByIdAndDelete(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
