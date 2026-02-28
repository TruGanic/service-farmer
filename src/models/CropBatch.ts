import mongoose, { Schema, Document } from 'mongoose';
import * as mongooseLib from 'mongoose';

export interface ICropBatch extends mongooseLib.Document {
    authId: string;
    zoneId: string;
    batchId: string;
    date: Date;
    cropVariety: string;
    seedQuantity: number;
    areaCovered: number;
    status: 'Active' | 'Harvested' | 'Failed';
    currentOrganicLevel: number;
    createdAt: Date;
    updatedAt: Date;
}

const CropBatchSchema: Schema = new mongooseLib.Schema(
    {
        authId: { type: String, required: true },
        zoneId: { type: String, required: true },
        batchId: { type: String, required: true, unique: true },
        date: { type: Date, required: true },
        cropVariety: { type: String, required: true },
        seedQuantity: { type: Number, required: true },
        areaCovered: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Active', 'Harvested', 'Failed'],
            default: 'Active',
        },
        currentOrganicLevel: { type: Number, default: 100 },
    },
    { timestamps: true }
);

export default mongooseLib.model<ICropBatch>('CropBatch', CropBatchSchema);
