import { Router } from 'express';
import { createPlantingLog } from '../controllers/plantingController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// POST /api/logs/planting
router.post('/planting', requireAuth, createPlantingLog);

export default router;
