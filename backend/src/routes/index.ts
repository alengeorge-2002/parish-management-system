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
import { getAllWards, addUnitToWard, getAllFamilies, createFamily, updateFamily } from '../controllers/admin-controller';
import { search } from '../controllers/directory-controller';
import { getQuickContacts } from '../controllers/parish-council-controller';

const router = Router();

// Core direct API route aliases
router.get('/wards', getAllWards);
router.post('/wards/:id/units', addUnitToWard);
router.get('/families', getAllFamilies);
router.post('/families', createFamily);
router.put('/families/:id', updateFamily);
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
