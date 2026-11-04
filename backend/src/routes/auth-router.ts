import { Router } from 'express';
import { login, generateKey } from '../controllers/auth-controller';
import { validateLogin } from '../middleware/validate';

const router = Router();

// Route for authenticating an access key and generating a long-lasting JWT
router.post('/login', validateLogin, login);

// Route for generating new alphanumeric access keys using crypto
router.get('/generate-key', generateKey);

export default router;
