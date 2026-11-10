import { Request, Response } from 'express';
import { pool } from '../config/db';

export interface MassTimingItem {
  id: string;
  time: string;
  language: string;
  celebrant: string;
  notes?: string;
}

export interface ScriptureReadingItem {
  reading: string;
  citation: string;
}

export const DEFAULT_MASS_TIMINGS: MassTimingItem[] = [
  { id: 'm1', time: '06:30 AM', language: 'Malayalam', celebrant: 'Parish Priest', notes: '' },
  { id: 'm2', time: '06:00 PM', language: 'Malayalam', celebrant: 'Parish Priest', notes: '' },
];

const VALID_SEASONS = new Set(['Advent', 'Christmas', 'Lent', 'Easter', 'Ordinary']);
const DEFAULT_FEAST_TITLE = 'Ferial day — no major feast';

let liturgicalSchemaEnsured = false;

const formatLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeDateParam = (input: unknown): string | null => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed === 'today') return formatLocalDateString();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return trimmed;
};

const sanitizeMassTimings = (items: unknown[]): MassTimingItem[] =>
  items
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item, idx) => ({
      id: String(item.id || `m-${idx + 1}-${Date.now()}`).trim(),
      time: String(item.time || '').trim(),
      language: String(item.language || 'Malayalam').trim() || 'Malayalam',
      celebrant: String(item.celebrant || 'Parish Priest').trim() || 'Parish Priest',
      notes: String(item.notes || '').trim(),
    }))
    .filter((item) => item.time.length > 0);

const sanitizeScriptureReadings = (items: unknown[]): ScriptureReadingItem[] =>
  items
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      reading: String(item.reading || item.title || item.type || 'Reading').trim(),
      citation: String(item.citation || item.reference || item.ref || '').trim(),
    }))
    .filter((item) => item.citation.length > 0);

const normalizeSeason = (season: unknown, fallback = 'Ordinary'): string => {
  if (typeof season !== 'string') return fallback;
  const trimmed = season.trim();
  const match = Array.from(VALID_SEASONS).find((s) => s.toLowerCase() === trimmed.toLowerCase());
  return match || fallback;
};

/**
 * Ensures the liturgical_schedules PostgreSQL table exists cleanly.
 */
export const ensureLiturgicalSchedulesSchema = async (force = false): Promise<void> => {
  if (liturgicalSchemaEnsured && !force) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS liturgical_schedules (
        id SERIAL PRIMARY KEY,
        schedule_date DATE UNIQUE NOT NULL,
        feast_title VARCHAR(255) DEFAULT 'Ferial day — no major feast',
        feast_title_ml VARCHAR(255),
        liturgical_season VARCHAR(50) DEFAULT 'Ordinary',
        mass_timings JSONB NOT NULL DEFAULT '[{"id":"m1","time":"06:30 AM","language":"Malayalam","celebrant":"Parish Priest","notes":""},{"id":"m2","time":"06:00 PM","language":"Malayalam","celebrant":"Parish Priest","notes":""}]'::jsonb,
        scripture_readings JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE liturgical_schedules ADD COLUMN IF NOT EXISTS feast_title_ml VARCHAR(255);
      ALTER TABLE liturgical_schedules ADD COLUMN IF NOT EXISTS liturgical_season VARCHAR(50) DEFAULT 'Ordinary';
      ALTER TABLE liturgical_schedules ADD COLUMN IF NOT EXISTS mass_timings JSONB NOT NULL DEFAULT '[{"id":"m1","time":"06:30 AM","language":"Malayalam","celebrant":"Parish Priest","notes":""},{"id":"m2","time":"06:00 PM","language":"Malayalam","celebrant":"Parish Priest","notes":""}]'::jsonb;
      ALTER TABLE liturgical_schedules ADD COLUMN IF NOT EXISTS scripture_readings JSONB NOT NULL DEFAULT '[]'::jsonb;
      ALTER TABLE liturgical_schedules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      CREATE INDEX IF NOT EXISTS idx_liturgical_schedules_date ON liturgical_schedules(schedule_date);
    `);
    liturgicalSchemaEnsured = true;
  } catch (err) {
    console.warn('ensureLiturgicalSchedulesSchema notice:', err);
  }
};

/**
 * Fetches legacy calendar records + liturgical_schedules merged list.
 */
export const getAllCalendarDays = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureLiturgicalSchedulesSchema();
    const legacyResult = await pool.query(
      `SELECT id, id as _id, date_string as "dateString", day_data as "dayData"
       FROM calendar
       ORDER BY date_string ASC`
    );
    const list = legacyResult.rows.map((r: any) => ({
      id: String(r.id),
      _id: String(r.id),
      dateString: r.dateString,
      ...(r.dayData || {}),
    }));
    res.json(list);
  } catch (error: any) {
    console.error('Fetch calendar error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Fetches dynamic schedule for a specific date (`GET /api/calendar/day?date=YYYY-MM-DD`).
 * Returns DB record if present, legacy fallback if present, or dynamic defaults with 2 Masses.
 */
export const getDaySchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureLiturgicalSchedulesSchema();
    const rawDate = req.query.date ?? req.params.date;
    const targetDate = rawDate === undefined ? formatLocalDateString() : normalizeDateParam(rawDate);

    if (!targetDate) {
      res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
      return;
    }

    const result = await pool.query(
      `SELECT id,
              TO_CHAR(schedule_date, 'YYYY-MM-DD') as schedule_date,
              feast_title,
              feast_title_ml,
              liturgical_season,
              mass_timings,
              scripture_readings,
              updated_at
       FROM liturgical_schedules
       WHERE schedule_date = $1::date`,
      [targetDate]
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      res.json({
        id: row.id,
        schedule_date: row.schedule_date,
        feast_title: row.feast_title || DEFAULT_FEAST_TITLE,
        feast_title_ml: row.feast_title_ml || '',
        liturgical_season: normalizeSeason(row.liturgical_season),
        mass_timings: Array.isArray(row.mass_timings) ? row.mass_timings : DEFAULT_MASS_TIMINGS,
        scripture_readings: Array.isArray(row.scripture_readings) ? row.scripture_readings : [],
        is_default: false,
        updated_at: row.updated_at,
      });
      return;
    }

    // Check legacy calendar table as read-only fallback
    const legacyRes = await pool.query(
      `SELECT date_string, day_data FROM calendar WHERE date_string = $1`,
      [targetDate]
    );

    if (legacyRes.rows.length > 0 && legacyRes.rows[0].day_data) {
      const dayData = legacyRes.rows[0].day_data;
      const legacyReadings = Array.isArray(dayData.readings)
        ? sanitizeScriptureReadings(dayData.readings)
        : [];
      const legacyMasses = Array.isArray(dayData.mass_timings) && dayData.mass_timings.length > 0
        ? sanitizeMassTimings(dayData.mass_timings)
        : DEFAULT_MASS_TIMINGS;

      res.json({
        schedule_date: targetDate,
        feast_title: dayData.feast_title || dayData.title || DEFAULT_FEAST_TITLE,
        feast_title_ml: dayData.feast_title_ml || dayData.title_ml || '',
        liturgical_season: normalizeSeason(dayData.liturgical_season || dayData.season),
        mass_timings: legacyMasses,
        scripture_readings: legacyReadings,
        is_default: false,
      });
      return;
    }

    res.json({
      schedule_date: targetDate,
      feast_title: DEFAULT_FEAST_TITLE,
      feast_title_ml: '',
      liturgical_season: 'Ordinary',
      mass_timings: DEFAULT_MASS_TIMINGS,
      scripture_readings: [],
      is_default: true,
    });
  } catch (error: any) {
    console.error('getDaySchedule error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Fetches all saved schedules for a given year and month (`GET /api/calendar/month?year=YYYY&month=MM`).
 */
export const getMonthSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureLiturgicalSchedulesSchema();
    const now = new Date();
    const year = req.query.year ? parseInt(String(req.query.year), 10) : now.getFullYear();
    const month = req.query.month ? parseInt(String(req.query.month), 10) : now.getMonth() + 1;

    if (isNaN(year) || year < 1900 || year > 2100 || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ error: 'Invalid year or month parameter.' });
      return;
    }

    const result = await pool.query(
      `SELECT id,
              TO_CHAR(schedule_date, 'YYYY-MM-DD') as schedule_date,
              feast_title,
              feast_title_ml,
              liturgical_season,
              mass_timings,
              scripture_readings,
              updated_at
       FROM liturgical_schedules
       WHERE EXTRACT(YEAR FROM schedule_date) = $1
         AND EXTRACT(MONTH FROM schedule_date) = $2
       ORDER BY schedule_date ASC`,
      [year, month]
    );

    const schedules = result.rows.map((row: any) => ({
      id: row.id,
      schedule_date: row.schedule_date,
      feast_title: row.feast_title || DEFAULT_FEAST_TITLE,
      feast_title_ml: row.feast_title_ml || '',
      liturgical_season: normalizeSeason(row.liturgical_season),
      mass_timings: Array.isArray(row.mass_timings) ? row.mass_timings : DEFAULT_MASS_TIMINGS,
      scripture_readings: Array.isArray(row.scripture_readings) ? row.scripture_readings : [],
      is_default: false,
      updated_at: row.updated_at,
    }));

    res.json({ year, month, schedules });
  } catch (error: any) {
    console.error('getMonthSchedules error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Upserts schedule for a specific date (`POST` or `PUT /api/calendar/day`).
 * Preserves untouched fields when performing partial updates (e.g. only updating scripture_readings).
 */
export const upsertDaySchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureLiturgicalSchedulesSchema();
    const rawDate = req.body.schedule_date || req.body.date || req.params.date;
    const targetDate = normalizeDateParam(rawDate);

    if (!targetDate) {
      res.status(400).json({ error: 'Valid schedule_date (YYYY-MM-DD) is required.' });
      return;
    }

    const existingRes = await pool.query(
      `SELECT feast_title, feast_title_ml, liturgical_season, mass_timings, scripture_readings
       FROM liturgical_schedules
       WHERE schedule_date = $1::date`,
      [targetDate]
    );
    const existing = existingRes.rows[0] || null;

    const feastTitle =
      'feast_title' in req.body
        ? String(req.body.feast_title ?? '').trim() || DEFAULT_FEAST_TITLE
        : existing?.feast_title || DEFAULT_FEAST_TITLE;

    const feastTitleMl =
      'feast_title_ml' in req.body
        ? String(req.body.feast_title_ml ?? '').trim()
        : existing?.feast_title_ml || '';

    const liturgicalSeason =
      'liturgical_season' in req.body
        ? normalizeSeason(req.body.liturgical_season, existing?.liturgical_season || 'Ordinary')
        : normalizeSeason(existing?.liturgical_season, 'Ordinary');

    const massTimings: MassTimingItem[] =
      'mass_timings' in req.body && Array.isArray(req.body.mass_timings)
        ? sanitizeMassTimings(req.body.mass_timings)
        : Array.isArray(existing?.mass_timings)
        ? existing.mass_timings
        : DEFAULT_MASS_TIMINGS;

    const scriptureReadings: ScriptureReadingItem[] =
      'scripture_readings' in req.body && Array.isArray(req.body.scripture_readings)
        ? sanitizeScriptureReadings(req.body.scripture_readings)
        : Array.isArray(existing?.scripture_readings)
        ? existing.scripture_readings
        : [];

    const upsertRes = await pool.query(
      `INSERT INTO liturgical_schedules (
         schedule_date, feast_title, feast_title_ml, liturgical_season, mass_timings, scripture_readings, updated_at
       ) VALUES ($1::date, $2, $3, $4, $5::jsonb, $6::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (schedule_date) DO UPDATE SET
         feast_title = EXCLUDED.feast_title,
         feast_title_ml = EXCLUDED.feast_title_ml,
         liturgical_season = EXCLUDED.liturgical_season,
         mass_timings = EXCLUDED.mass_timings,
         scripture_readings = EXCLUDED.scripture_readings,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id,
                 TO_CHAR(schedule_date, 'YYYY-MM-DD') as schedule_date,
                 feast_title,
                 feast_title_ml,
                 liturgical_season,
                 mass_timings,
                 scripture_readings,
                 updated_at`,
      [
        targetDate,
        feastTitle,
        feastTitleMl,
        liturgicalSeason,
        JSON.stringify(massTimings),
        JSON.stringify(scriptureReadings),
      ]
    );

    const saved = upsertRes.rows[0];
    res.json({
      id: saved.id,
      schedule_date: saved.schedule_date,
      feast_title: saved.feast_title,
      feast_title_ml: saved.feast_title_ml || '',
      liturgical_season: saved.liturgical_season,
      mass_timings: Array.isArray(saved.mass_timings) ? saved.mass_timings : DEFAULT_MASS_TIMINGS,
      scripture_readings: Array.isArray(saved.scripture_readings) ? saved.scripture_readings : [],
      is_default: false,
      updated_at: saved.updated_at,
    });
  } catch (error: any) {
    console.error('upsertDaySchedule error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Fetches a single legacy calendar record by date string (YYYY-MM-DD).
 */
export const getCalendarByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureLiturgicalSchedulesSchema();
    const rawParam = req.params.dateString;
    const dateString = rawParam === 'today' ? formatLocalDateString() : String(rawParam);

    // Prefer liturgical_schedules if a record exists for this date
    const schedRes = await pool.query(
      `SELECT id,
              TO_CHAR(schedule_date, 'YYYY-MM-DD') as schedule_date,
              feast_title,
              feast_title_ml,
              liturgical_season,
              mass_timings,
              scripture_readings
       FROM liturgical_schedules
       WHERE schedule_date = $1::date`,
      [dateString]
    );

    if (schedRes.rows.length > 0) {
      const row = schedRes.rows[0];
      res.json({
        id: String(row.id),
        _id: String(row.id),
        dateString: row.schedule_date,
        schedule_date: row.schedule_date,
        feast_title: row.feast_title,
        feast_title_ml: row.feast_title_ml || '',
        liturgical_season: row.liturgical_season,
        mass_timings: row.mass_timings,
        scripture_readings: row.scripture_readings,
      });
      return;
    }

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
      ...(r.dayData || {}),
    });
  } catch (error: any) {
    console.error('Fetch calendar by date error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
