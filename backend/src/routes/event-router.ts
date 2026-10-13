import { Router } from 'express';
import {
  getAllEvents,
  getTodayEvents,
  createFeast,
  deleteFeast,
} from '../controllers/feast-controller';
import { requireAuth, requireAdmin } from '../middleware/auth-middleware';

const router = Router();

// Read events & today's calendar (publicly readable)
router.get('/', getAllEvents);
router.get('/today', getTodayEvents);

// Create event pointing to /api/events/create
router.post('/create', requireAuth, requireAdmin, createFeast);

// Delete event pointing to /api/events/delete/:id
router.delete('/delete/:id', requireAuth, requireAdmin, deleteFeast);

export default router;
