import { Router } from 'express';
import { createPlantingLog } from '../controllers/plantingController';
import { createInputLog } from '../controllers/inputController';
import { createHarvestLog, updateHarvestStatus } from '../controllers/harvestController';
import { getHistory, getRecentActivity } from '../controllers/historyController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// POST /api/logs/planting
router.post('/planting', requireAuth, createPlantingLog);

// POST /api/logs/input
router.post('/input', requireAuth, createInputLog);

// POST /api/logs/harvest
router.post('/harvest', requireAuth, createHarvestLog);

// PATCH /api/logs/harvest/:id/transport
router.patch('/harvest/:id/transport', requireAuth, updateHarvestStatus);

// GET /api/logs/history
router.get('/history', requireAuth, getHistory);

// GET /api/logs/recent
router.get('/recent', requireAuth, getRecentActivity);

export default router;
