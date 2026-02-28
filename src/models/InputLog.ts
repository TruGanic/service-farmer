import mongoose, { Schema, Document } from 'mongoose';

export interface IInputLog extends Document {
    authId: string;
    zoneId: string;
    batchId: string;
    date: Date;
    inputCategory: 'Organic Fertilizer' | 'Chemical Fertilizer' | 'Pesticide';
    productName: string;
    quantity: number;
    unit: 'kg' | 'L';
    createdAt: Date;
    updatedAt: Date;
}

const InputLogSchema: Schema = new Schema(
    {
        authId: { type: String, required: true },
        zoneId: { type: String, required: true },
        batchId: { type: String, required: true },
        date: { type: Date, required: true },
        inputCategory: {
            type: String,
            enum: ['Organic Fertilizer', 'Chemical Fertilizer', 'Pesticide'],
            required: true,
        },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: {
            type: String,
            enum: ['kg', 'L'],
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IInputLog>('InputLog', InputLogSchema);
