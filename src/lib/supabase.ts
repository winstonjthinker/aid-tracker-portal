
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase URL and key are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and/or Anonymous Key are not set in environment variables.')
  console.error('Please make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

// Create a single supabase client for interacting with your database
// Use placeholder values if env vars are missing to prevent app from crashing
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
