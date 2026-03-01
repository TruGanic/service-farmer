import mongoose, { Schema, Document } from 'mongoose';

export interface IHarvestLog extends Document {
    authId: string;
    zoneId: string;
    batchId: string;
    date: Date;
    plantedDate: Date;
    cropVariety: string;
    yieldAmount: number;
    marketDestination: string;
    status: 'Harvested' | 'Transported';
    createdAt: Date;
    updatedAt: Date;
}

const HarvestLogSchema: Schema = new Schema(
    {
        authId: { type: String, required: true },
        zoneId: { type: String, required: true },
        batchId: { type: String, required: true },
        date: { type: Date, required: true },
        plantedDate: { type: Date, required: true },
        cropVariety: { type: String, required: true },
        yieldAmount: { type: Number, required: true }, // in kg
        marketDestination: { type: String, required: true },
        status: {
            type: String,
            enum: ['Harvested', 'Transported'],
            default: 'Harvested',
        },
    },
    { timestamps: true }
);

export default mongoose.model<IHarvestLog>('HarvestLog', HarvestLogSchema);
