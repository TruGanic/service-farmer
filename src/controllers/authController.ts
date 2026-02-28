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

export const loginFarmer = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
        res.status(400).json({ error: 'Missing required fields: email, password' });
        return;
    }

    try {
        // Step A: Authenticate user in Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // Step B: Handle Supabase authentication errors
        if (authError || !authData.user) {
            console.error('Supabase login error:', authError);
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Step C: Extract user.id and access_token
        const userId = authData.user.id;
        const accessToken = authData.session.access_token;

        // Step D: Query MongoDB for farmer profile data
        const farmer = await Farmer.findOne({ authId: userId });

        if (!farmer) {
            // User exists in Supabase but profile is missing in MongoDB
            res.status(404).json({ error: 'Farmer profile not found' });
            return;
        }

        // Response: Return 200 OK with JWT and profile data
        res.status(200).json({
            message: 'Login successful',
            token: accessToken,
            farmer: {
                authId: farmer.authId, // Include authId for frontend QR generation
                username: farmer.username,
                email: farmer.email,
                contactNo: farmer.contactNo,
                farmName: farmer.farmName,
                totalArea: farmer.totalArea,
                location: farmer.location,
                sensorId: farmer.sensorId,
            },
        });
    } catch (error: any) {
        console.error('Login flow error:', error);
        res.status(500).json({ error: 'Internal server error during login', details: error.message });
    }
};
