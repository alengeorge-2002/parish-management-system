import { Router } from 'express';
import { search } from '../controllers/directory-controller';
import { getClergy } from '../controllers/clergy-controller';
import { getAllReligiousHouses } from '../controllers/religious-house-controller';

const router = Router();

// Route for dynamic directory search with PostgreSQL joins across members, families, and wards
router.get('/search', search);

// Route for querying the clergy directory table
router.get('/clergy', getClergy);

// Route for querying the religious houses list
router.get('/religious-houses', getAllReligiousHouses);

export default router;
