import { Router } from 'express';
import {
  getMinistriesDirectory,
  getAllMinistriesAdmin,
  createMinistry,
  updateMinistry,
  deleteMinistry,
  getMinistryMembersAdmin,
  createMinistryMember,
  updateMinistryMember,
  deleteMinistryMember,
  addMemberToMinistry,
  removeMemberFromMinistry,
} from '../controllers/ministry-controller';
import { requireAuth, requireAdmin } from '../middleware/auth-middleware';

const router = Router();

// Public route for active groups directory
router.get('/directory/ministries', getMinistriesDirectory);

// Direct ministry member management routes (supporting /api/ministries/:id/members)
router.post('/ministries/:id/members', addMemberToMinistry);
router.delete('/ministries/:id/members/:memberId', removeMemberFromMinistry);

// Admin-protected CRUD routes
router.get('/admin/ministries', requireAuth, requireAdmin, getAllMinistriesAdmin);
router.post('/admin/ministries', requireAuth, requireAdmin, createMinistry);
router.post('/admin/ministries/:id/members', addMemberToMinistry);
router.put('/admin/ministries/:id', requireAuth, requireAdmin, updateMinistry);
router.delete('/admin/ministries/:id', requireAuth, requireAdmin, deleteMinistry);
router.delete('/admin/ministries/:id/members/:memberId', removeMemberFromMinistry);

router.get('/admin/ministry-members', requireAuth, requireAdmin, getMinistryMembersAdmin);
router.post('/admin/ministry-members', requireAuth, requireAdmin, createMinistryMember);
router.put('/admin/ministry-members/:id', requireAuth, requireAdmin, updateMinistryMember);
router.delete('/admin/ministry-members/:id', requireAuth, requireAdmin, deleteMinistryMember);

export default router;
