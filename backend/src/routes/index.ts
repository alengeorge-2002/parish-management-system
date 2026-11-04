import { Router } from 'express';
import authRouter from './auth-router';
import directoryRouter from './directory-router';
import adminRouter from './admin-router';
import announcementRouter from './announcement-router';
import feastRouter from './feast-router';
import eventRouter from './event-router';
import ministryRouter from './ministry-router';
import parishCouncilRouter from './parish-council-router';
import notificationRouter from './notification-router';
import calendarRouter from './calendar-routes';
import {
  getAllWards,
  createWard,
  updateWard,
  deleteWard,
  addUnitToWard,
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/admin-controller';
import { search } from '../controllers/directory-controller';
import { getQuickContacts } from '../controllers/parish-council-controller';
import { validateCreateFamily, validateCreateMember } from '../middleware/validate';
import { uploadFamilyPhoto } from '../middleware/upload-middleware';

const router = Router();

const directFamilyPhotoUpload = uploadFamilyPhoto.fields([
  { name: 'familyPhoto', maxCount: 1 },
  { name: 'family_photo', maxCount: 1 },
]);

// Core direct API route aliases
router.get('/wards', getAllWards);
router.post('/wards', createWard);
router.put('/wards/:id', updateWard);
router.delete('/wards/:id', deleteWard);
router.post('/wards/:id/units', addUnitToWard);

router.get('/families', getAllFamilies);
router.get('/families/:id', getFamilyById);
router.post('/families', directFamilyPhotoUpload, validateCreateFamily, createFamily);
router.put('/families/:id', directFamilyPhotoUpload, updateFamily);
router.delete('/families/:id', deleteFamily);

router.get('/members', getAllMembers);
router.post('/members', validateCreateMember, createMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
router.get('/parishioners', search);
router.get('/clergy/quick-contacts', getQuickContacts);

// Module routers
router.use('/auth', authRouter);
router.use('/directory', directoryRouter);
router.use('/admin', adminRouter);
router.use('/members', adminRouter);
router.use('/families', adminRouter);
router.use('/religious-houses', adminRouter);
router.use('/clergy', adminRouter);
router.use('/announcements', announcementRouter);
router.use('/feasts', feastRouter);
router.use('/events', eventRouter);
router.use('/calendar', calendarRouter);
router.use('/readings', calendarRouter);
router.use('/liturgical', calendarRouter);
router.use('/notifications', notificationRouter);
router.use('/', ministryRouter);
router.use('/', parishCouncilRouter);

export default router;
