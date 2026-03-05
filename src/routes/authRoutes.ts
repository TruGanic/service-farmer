import { Router } from 'express';
import { registerFarmer, loginFarmer, refreshSession } from '../controllers/authController';

const router = Router();

// POST /api/auth/register
router.post('/register', registerFarmer);

// POST /api/auth/login
router.post('/login', loginFarmer);

// POST /api/auth/refresh
router.post('/refresh', refreshSession);

export default router;
