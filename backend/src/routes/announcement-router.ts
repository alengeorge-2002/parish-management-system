import { Router } from 'express';
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement-controller';
import { requireAuth, requireAdmin } from '../middleware/auth-middleware';

const router = Router();

// Read announcements is public for parishioner app feed
router.get('/', getAllAnnouncements);

// Write announcements strictly requires administrative privileges
router.post('/', requireAuth, requireAdmin, createAnnouncement);
router.put('/:id', requireAuth, requireAdmin, updateAnnouncement);
router.delete('/:id', requireAuth, requireAdmin, deleteAnnouncement);

export default router;
