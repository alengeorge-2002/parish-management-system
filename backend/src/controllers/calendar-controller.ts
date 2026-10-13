import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

/**
 * Fetches all calendar records (e.g. for the whole liturgical year).
 */
export const getAllCalendarDays = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, id as _id, date_string as "dateString", day_data as "dayData"
       FROM calendar
       ORDER BY date_string ASC`
    );
    const list = result.rows.map((r: any) => ({
      id: String(r.id),
      _id: String(r.id),
      dateString: r.dateString,
      ...(r.dayData || {})
    }));
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
    const result = await pool.query(
      `SELECT id, id as _id, date_string as "dateString", day_data as "dayData"
       FROM calendar
       WHERE date_string = $1`,
      [dateString]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Calendar record not found' });
      return;
    }
    const r = result.rows[0];
    res.json({
      id: String(r.id),
      _id: String(r.id),
      dateString: r.dateString,
      ...(r.dayData || {})
    });
  } catch (error: any) {
    console.error('Fetch calendar by date error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
