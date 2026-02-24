import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase URL or Service Role Key is missing. Please check your .env file.');
}

// Use the service role key to bypass RLS and be able to use admin endpoints if needed
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
