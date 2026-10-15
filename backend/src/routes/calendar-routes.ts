import { Router } from 'express';
import { getAllCalendarDays, getCalendarByDate } from '../controllers/calendar-controller';
import { getTodayEvents } from '../controllers/feast-controller';

const router = Router();

router.get('/', getAllCalendarDays);
router.get('/today', getTodayEvents);
router.get('/:dateString', getCalendarByDate);

export default router;

