import { Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import HarvestLog from '../models/HarvestLog';
import CropBatch from '../models/CropBatch';

export const createHarvestLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const authId = req.user?.id;

        if (!authId) {
            res.status(401).json({ error: 'Unauthorized: User ID missing from request' });
            return;
        }

        const { zoneId, date, yieldAmount, marketDestination } = req.body;

        // Basic validation
        if (!zoneId || !date || !yieldAmount || !marketDestination) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Check for existing active crop batch in the same zone for this user
        const activeBatch = await CropBatch.findOne({
            authId: authId,
            zoneId: zoneId,
            status: 'Active'
        });

        if (!activeBatch) {
            res.status(400).json({
                error: 'No active crop batch found for this zone. Cannot log harvest.'
            });
            return;
        }

        // Extract the batchId from the active batch
        const batchId = activeBatch.batchId;

        // Create new harvest log document
        const newHarvestLog = new HarvestLog({
            authId,
            zoneId,
            batchId,
            date: new Date(date),
            cropVariety: activeBatch.cropVariety, // Auto-fetched from the planting record!
            yieldAmount: Number(yieldAmount),
            marketDestination
        });

        const savedHarvestLog = await newHarvestLog.save();

        // Close the Loop: Update the found CropBatch document
        activeBatch.status = 'Harvested';
        await activeBatch.save();

        res.status(201).json({
            message: 'Harvest log created successfully and crop batch closed',
            harvestLog: savedHarvestLog
        });

    } catch (error: any) {
        console.error('Error creating harvest log:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

export const updateHarvestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const authId = req.user?.id;
        const { id } = req.params;

        if (!authId) {
            res.status(401).json({ error: 'Unauthorized: User ID missing from request' });
            return;
        }

        const harvestLog = await HarvestLog.findOne({ _id: id, authId });

        if (!harvestLog) {
            res.status(404).json({ error: 'Harvest log not found or unauthorized' });
            return;
        }

        harvestLog.status = 'Transported';
        await harvestLog.save();

        res.status(200).json({
            message: 'Harvest log marked as transported',
            harvestLog
        });

    } catch (error: any) {
        console.error('Error updating harvest log status:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
