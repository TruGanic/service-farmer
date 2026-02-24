import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import Farmer from '../models/Farmer';

export const registerFarmer = async (req: Request, res: Response): Promise<void> => {
    const {
        username,
        contactNo,
        email,
        password,
        farmName,
        totalArea,
        location,
        sensorId,
    } = req.body;

    // Basic validation
    if (!username || !email || !password || !contactNo) {
        res.status(400).json({ error: 'Missing required fields: username, email, password, contactNo' });
        return;
    }

    let createdUserId: string | null = null;

    try {
        // Step A: Create user in Supabase
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto confirm for seamless experience
            user_metadata: { username, contactNo }
        });

        if (authError) {
            console.error('Supabase signup error:', authError);
            res.status(400).json({ error: authError.message });
            return;
        }

        if (!authData.user) {
            res.status(500).json({ error: 'Failed to create user in Supabase' });
            return;
        }

        // Step B: Extract the resulting user.id (UUID)
        createdUserId = authData.user.id;

        // Step C: Create document in MongoDB mapping the UUID to authId
        const newFarmer = new Farmer({
            authId: createdUserId,
            username,
            contactNo,
            email,
            farmName,
            totalArea,
            location,
            sensorId,
        });

        const savedFarmer = await newFarmer.save();

        // Response: Remove sensitive/internal mongoose data if necessary (save resolves plain doc after toObject or we send it directly)
        res.status(201).json({
            message: 'Farmer registered successfully',
            farmer: {
                id: savedFarmer._id,
                authId: savedFarmer.authId,
                username: savedFarmer.username,
                email: savedFarmer.email,
                contactNo: savedFarmer.contactNo,
                farmName: savedFarmer.farmName,
                totalArea: savedFarmer.totalArea,
                location: savedFarmer.location,
                sensorId: savedFarmer.sensorId,
            }
        });
    } catch (error: any) {
        console.error('Registration flow error:', error);

        // Rollback Mechanism: If MongoDB save failed and Supabase user was created, delete it
        if (createdUserId) {
            console.log(`Rolling back created user ${createdUserId} from Supabase...`);
            const { error: deletionError } = await supabase.auth.admin.deleteUser(createdUserId);
            if (deletionError) {
                console.error('Failed to rollback Supabase user:', deletionError);
            } else {
                console.log('Rollback successful: Orphaned Supabase user deleted.');
            }
        }

        res.status(500).json({ error: 'Internal server error during registration', details: error.message });
    }
};
