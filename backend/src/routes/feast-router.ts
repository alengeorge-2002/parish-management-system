import { Router } from 'express';
import {
  getAllFeasts,
  getTodayEvents,
  createFeast,
  deleteFeast,
} from '../controllers/feast-controller';
import { requireAuth, requireAdmin } from '../middleware/auth-middleware';

const router = Router();

// Read feasts
router.get('/', getAllFeasts);
router.get('/today', getTodayEvents);

// Write feasts strictly requires administrative privileges
router.post('/', requireAuth, requireAdmin, createFeast);
router.delete('/:id', requireAuth, requireAdmin, deleteFeast);

export default router;
