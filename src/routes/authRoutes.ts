import { Router } from 'express';
import { registerFarmer, loginFarmer } from '../controllers/authController';

const router = Router();

// POST /api/auth/register
router.post('/register', registerFarmer);

// POST /api/auth/login
router.post('/login', loginFarmer);

export default router;
