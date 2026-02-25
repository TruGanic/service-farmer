import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Extend the standard Express Request interface
export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const requireAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    // Check for the Authorization header and ensure it starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
        return;
    }

    // Extract the raw token string
    const token = authHeader.split(' ')[1];

    try {
        // Securely verify the token directly against Supabase servers
        const { data, error } = await supabase.auth.getUser(token);

        // If Supabase returns an error or fails to find the user
        if (error || !data.user) {
            console.error('Supabase token verification error:', error?.message);
            res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
            return;
        }

        // Attach the Supabase UUID to the extended req.user object
        req.user = {
            id: data.user.id, // Supabase UUID
        };

        // Pass control to the next middleware or route handler
        next();
    } catch (err: any) {
        console.error('Unexpected error during token verification:', err.message);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};
