
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Log status for debugging
console.log('Supabase client initialized with URL:', supabaseUrl === 'https://placeholder-url.supabase.co' ? 'PLACEHOLDER (connect to Supabase)' : 'CUSTOM URL')
