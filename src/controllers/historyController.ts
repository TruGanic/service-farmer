import { Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import CropBatch from '../models/CropBatch';
import InputLog from '../models/InputLog';
import HarvestLog from '../models/HarvestLog';

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const authId = req.user?.id;

        if (!authId) {
            res.status(401).json({ error: 'Unauthorized: User ID missing from request' });
            return;
        }

        // Fetch all data concurrently
        const [plantings, inputs, harvests] = await Promise.all([
            CropBatch.find({ authId }).sort({ date: -1 }),
            InputLog.find({ authId }).sort({ date: -1 }),
            HarvestLog.find({ authId }).sort({ date: -1 })
        ]);

        // Map to frontend expected structure
        const mappedPlantings = plantings.map(p => ({
            id: p._id.toString(),
            date: new Date(p.date).toISOString().split('T')[0],
            cropVariety: p.cropVariety,
            seedAmount: `${p.seedQuantity} seeds/seedlings`,
            areaCovered: `${p.areaCovered} Acres`
        }));

        const mappedInputs = inputs.map(i => ({
            id: i._id.toString(),
            date: new Date(i.date).toISOString().split('T')[0],
            category: i.inputCategory,
            productName: i.productName,
            quantity: `${i.quantity} ${i.unit}`,
            location: i.zoneId
        }));

        const mappedHarvests = harvests.map(h => {
            const batch = plantings.find(p => p.batchId === h.batchId);
            return {
                id: h._id.toString(),
                date: new Date(h.date).toISOString().split('T')[0],
                cropVariety: h.cropVariety,
                yieldAmount: `${h.yieldAmount} kg`,
                marketDestination: h.marketDestination,
                batchId: h.batchId,
                status: h.status || 'Harvested',
                organicLevel: batch ? batch.currentOrganicLevel : 'N/A'
            };
        });

        res.status(200).json({
            plantings: mappedPlantings,
            inputs: mappedInputs,
            harvests: mappedHarvests
        });

    } catch (error: any) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

export const getRecentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const authId = req.user?.id;

        if (!authId) {
            res.status(401).json({ error: 'Unauthorized: User ID missing from request' });
            return;
        }

        const [plantings, inputs, harvests] = await Promise.all([
            CropBatch.find({ authId }).sort({ date: -1 }).limit(3),
            InputLog.find({ authId }).sort({ date: -1 }).limit(3),
            HarvestLog.find({ authId }).sort({ date: -1 }).limit(3)
        ]);

        const activities: Array<{ id: string, type: string, action: string, date: Date }> = [];

        plantings.forEach(p => {
            activities.push({
                id: p._id.toString(),
                type: 'Planting',
                action: `Planted ${p.cropVariety}`,
                date: p.date
            });
        });

        inputs.forEach(i => {
            activities.push({
                id: i._id.toString(),
                type: 'Input',
                action: `${i.inputCategory === 'Pesticide' ? 'Applied' : 'Added'} ${i.productName}`,
                date: i.date
            });
        });

        harvests.forEach(h => {
            activities.push({
                id: h._id.toString(),
                type: 'Harvest',
                action: `Harvested ${h.cropVariety}`,
                date: h.date
            });
        });

        // Sort all merged activities by date descending and trim to strictly 3
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());
        const recentActivities = activities.slice(0, 3).map(a => ({
            id: a.id,
            type: a.type,
            action: a.action,
            date: a.date.toISOString(),
        }));

        res.status(200).json({
            recentActivity: recentActivities
        });

    } catch (error: any) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
