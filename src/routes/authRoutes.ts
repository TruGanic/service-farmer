import { Router } from 'express';
import { registerFarmer } from '../controllers/authController';

const router = Router();

// POST /api/auth/register
router.post('/register', registerFarmer);

export default router;
