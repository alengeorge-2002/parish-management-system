import { Router } from 'express';
import { getAllCalendarDays, getCalendarByDate } from '../controllers/calendar-controller';

const router = Router();

router.get('/', getAllCalendarDays);
router.get('/:dateString', getCalendarByDate);

export default router;
