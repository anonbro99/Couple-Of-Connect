
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Access environment variables using process.env as per the environment standards.
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize the Supabase client.
// Note: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
