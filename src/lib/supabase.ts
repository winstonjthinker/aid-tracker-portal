
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the client
export const supabase = supabaseClient;

// Helper function to check if we're using placeholder/mock values
export const isUsingMockSupabase = () => {
  return false; // We're now using a real Supabase instance
};

// Log status for debugging
console.log('Supabase client initialized and connected to:', supabase.supabaseUrl);

// Add a mock auth setup for development when Supabase is not connected
if (isUsingMockSupabase()) {
  console.log('Using mock auth setup with default admin credentials');
}
