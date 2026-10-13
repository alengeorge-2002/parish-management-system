import { Router } from 'express';
import { login, generateKey } from '../controllers/auth-controller';

const router = Router();

// Route for authenticating an access key and generating a long-lasting JWT
router.post('/login', login);

// Route for generating new alphanumeric access keys using crypto
router.get('/generate-key', generateKey);

export default router;
