
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the client
export const supabase = supabaseClient;

// Helper function to check if we're using placeholder/mock values
export const isUsingMockSupabase = () => {
  return false; // We're now using a real Supabase instance
};

// Log status for debugging
console.log('Supabase client initialized: connected to', supabase.supabaseUrl);

try {
  // Test the connection by making a simple request
  (async () => {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('⚠️ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connection test successful!');
    }
  })();
} catch (err) {
  console.error('Critical error testing Supabase connection:', err);
}
