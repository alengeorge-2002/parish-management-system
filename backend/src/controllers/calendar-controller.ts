import { Request, Response } from 'express';
import { Calendar } from '../models';

/**
 * Fetches all calendar records (e.g. for the whole year 2026).
 */
export const getAllCalendarDays = async (_req: Request, res: Response): Promise<void> => {
  try {
    const list = await Calendar.find().sort({ dateString: 1 });
    res.json(list);
  } catch (error: any) {
    console.error('Fetch calendar error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Fetches a single calendar record by date string (YYYY-MM-DD).
 */
export const getCalendarByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateString } = req.params;
    const record = await Calendar.findOne({ dateString });
    if (!record) {
      res.status(404).json({ error: 'Calendar record not found' });
      return;
    }
    res.json(record);
  } catch (error: any) {
    console.error('Fetch calendar by date error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
