
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Get environment variables with fallbacks to prevent runtime errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Expose the URL directly for comparison in AuthContext
supabase.supabaseUrl = supabaseUrl;

// Log status for debugging
console.log(
  'Supabase client initialized with URL:',
  supabaseUrl === 'https://placeholder-url.supabase.co' ? 'PLACEHOLDER (connect to Supabase)' : 'CUSTOM URL'
);

// Add a mock auth setup for development when Supabase is not connected
if (supabaseUrl === 'https://placeholder-url.supabase.co') {
  console.log('Using mock auth setup with default admin credentials');
}
