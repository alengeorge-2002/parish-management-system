import { Router } from 'express';
import {
  getAllCalendarDays,
  getCalendarByDate,
  getDaySchedule,
  getMonthSchedules,
  upsertDaySchedule,
} from '../controllers/calendar-controller';
import { getTodayEvents } from '../controllers/feast-controller';
import { requireAuth, requireAdmin } from '../middleware/auth-middleware';

const router = Router();

router.get('/', getAllCalendarDays);
router.get('/today', getTodayEvents);
router.get('/day', getDaySchedule);
router.get('/month', getMonthSchedules);
router.post('/day', requireAuth, requireAdmin, upsertDaySchedule);
router.put('/day', requireAuth, requireAdmin, upsertDaySchedule);
router.put('/day/:date', requireAuth, requireAdmin, upsertDaySchedule);
router.get('/:dateString', getCalendarByDate);

export default router;

