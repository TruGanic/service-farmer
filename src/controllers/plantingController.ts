import { Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import CropBatch from '../models/CropBatch';

export const createPlantingLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const farmerId = req.user?.id;

        if (!farmerId) {
            res.status(401).json({ error: 'Unauthorized: User ID missing from request' });
            return;
        }

        const { zoneId, date, cropVariety, seedQuantity, areaCovered } = req.body;

        // Basic validation
        if (!zoneId || !date || !cropVariety || !seedQuantity || !areaCovered) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Check for existing active crop batch in the same zone
        const existingActiveBatch = await CropBatch.findOne({
            zoneId,
            status: 'Active'
        });

        if (existingActiveBatch) {
            res.status(400).json({
                error: 'This zone already has an active crop batch. Please harvest or close it before planting again.'
            });
            return;
        }

        // Generate a shorter unique batchId (excluding zoneId)
        const sanitizedVariety = cropVariety.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
        const timestamp = Date.now().toString().slice(-6); // last 6 digits
        const batchId = `${sanitizedVariety}-${timestamp}`;

        // Create new document
        const newBatch = new CropBatch({
            authId: farmerId,
            zoneId,
            batchId,
            date: new Date(date),
            cropVariety,
            seedQuantity: Number(seedQuantity),
            areaCovered: Number(areaCovered)
        });

        const savedBatch = await newBatch.save();

        res.status(201).json({
            message: 'Planting log created successfully',
            batch: savedBatch
        });

    } catch (error: any) {
        console.error('Error creating planting log:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
