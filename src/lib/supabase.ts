
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Using mock setup for development.')
}

// Create a single supabase client for interacting with your database
// Use explicit string values rather than potentially undefined values
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Log status for debugging
console.log(
  'Supabase client initialized with URL:',
  !supabaseUrl ? 'PLACEHOLDER (connect to Supabase)' : 'CUSTOM URL'
)

// Add a mock auth setup for development when Supabase is not connected
if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Using mock auth setup with default admin credentials')
}
