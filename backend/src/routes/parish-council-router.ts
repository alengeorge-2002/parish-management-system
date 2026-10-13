import { Router } from 'express';
import {
  getAllSeatsAdmin,
  createSeat,
  updateSeat,
  deleteSeat,
  getQuickContacts,
  getParishCouncilDirectory,
  assignSeat,
  vacateSeat
} from '../controllers/parish-council-controller';
import { requireAuth, requireAdmin } from '../middleware/auth-middleware';

const router = Router();

// Public routes for active directory search/view
router.get('/directory/quick-contacts', getQuickContacts);
router.get('/directory/parish-council', getParishCouncilDirectory);
router.get('/parish-council/seats', getParishCouncilDirectory);
router.get('/parish-council', getParishCouncilDirectory);
router.post('/parish-council/seats', createSeat);
router.put('/parish-council/seats/:id/assign', assignSeat);
router.put('/parish-council/seats/:id/vacate', vacateSeat);
router.put('/parish-council/seats/:id', updateSeat);

// Admin role-protected CRUD routes for seat assignments
router.get('/admin/parish-council', requireAuth, requireAdmin, getAllSeatsAdmin);
router.post('/admin/parish-council', requireAuth, requireAdmin, createSeat);
router.put('/admin/parish-council/:id/assign', assignSeat);
router.put('/admin/parish-council/:id/vacate', vacateSeat);
router.put('/admin/parish-council/:id', requireAuth, requireAdmin, updateSeat);
router.delete('/admin/parish-council/:id', requireAuth, requireAdmin, deleteSeat);

export default router;


