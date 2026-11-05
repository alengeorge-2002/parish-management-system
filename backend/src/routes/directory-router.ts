import { Router } from 'express';
import { search, getDirectory, getDirectorySummary } from '../controllers/directory-controller';
import { getFamilies, getAllWards } from '../controllers/admin-controller';
import { getClergy } from '../controllers/clergy-controller';
import { getAllReligiousHouses } from '../controllers/religious-house-controller';
import { getMinistriesDirectory } from '../controllers/ministry-controller';
import { getAllSeatsAdmin, getQuickContacts } from '../controllers/parish-council-controller';

const router = Router();

// Summary / Meta counts endpoint
router.get('/summary', getDirectorySummary);
router.get('/meta', getDirectorySummary);

// Route for dynamic directory search with PostgreSQL joins across visible parishioners, families, and wards
router.get('/', getDirectory);
router.get('/search', search);
router.get('/families', getFamilies);
router.get('/wards', getAllWards);
router.get('/clergy', getClergy);
router.get('/religious-houses', getAllReligiousHouses);
router.get('/ministries', getMinistriesDirectory);
router.get('/parish-council', getAllSeatsAdmin);
router.get('/quick-contacts', getQuickContacts);

export default router;
