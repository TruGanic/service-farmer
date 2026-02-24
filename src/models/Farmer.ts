import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmer extends Document {
    authId: string; // Supabase UUID
    username: string;
    contactNo: string;
    email: string;
    farmName: string;
    totalArea: string;
    location: string;
    sensorId: string;
    createdAt: Date;
    updatedAt: Date;
}

const FarmerSchema: Schema = new Schema(
    {
        authId: { type: String, required: true, unique: true },
        username: { type: String, required: true },
        contactNo: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        farmName: { type: String, required: false },
        totalArea: { type: String, required: false },
        location: { type: String, required: false },
        sensorId: { type: String, required: false },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IFarmer>('Farmer', FarmerSchema);
