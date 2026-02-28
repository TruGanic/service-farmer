import { Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import InputLog from '../models/InputLog';
import CropBatch from '../models/CropBatch';

export const createInputLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const authId = req.user?.id;

        if (!authId) {
            res.status(401).json({ error: 'Unauthorized: User ID missing from request' });
            return;
        }

        const { zoneId, date, inputCategory, productName, quantity, unit } = req.body;

        // Basic validation
        if (!zoneId || !date || !inputCategory || !productName || !quantity || !unit) {
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
                error: 'No active crop batch found for this zone. Please log planting first.'
            });
            return;
        }

        // Extract the batchId from the active batch
        const batchId = activeBatch.batchId;

        // Create new input log document
        const newInputLog = new InputLog({
            authId,
            zoneId,
            batchId,
            date: new Date(date),
            inputCategory,
            productName,
            quantity: Number(quantity),
            unit
        });

        const savedInputLog = await newInputLog.save();

        res.status(201).json({
            message: 'Input log created successfully',
            inputLog: savedInputLog
        });

    } catch (error: any) {
        console.error('Error creating input log:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
