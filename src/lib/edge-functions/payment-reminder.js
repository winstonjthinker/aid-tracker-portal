
// Equal Access - Payment Reminder Edge Function
// This Edge Function sends reminders to clients with pending payments

// Import Supabase JS client
import { createClient } from '@supabase/supabase-js';

// Environment variables for this function should be set in Supabase Dashboard
// - SUPABASE_URL: Your Supabase project URL
// - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin access
// - SENDGRID_API_KEY: For sending emails

export default async function handler(req, res) {
  try {
    // Get Supabase service role client for admin operations
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get clients with pending payments
    const { data: pendingPayments, error: queryError } = await supabaseAdmin
      .from('client_payment_status')
      .select('*')
      .eq('payment_status', 'Pending');

    if (queryError) {
      console.error('Error querying pending payments:', queryError);
      return res.status(500).json({ error: 'Failed to query pending payments' });
    }

    console.log(`Found ${pendingPayments.length} clients with pending payments`);

    // For each client with pending payments, send a reminder
    // In an actual implementation, this would use SendGrid, Twilio or similar service
    const results = pendingPayments.map(client => {
      return {
        client_id: client.client_id,
        client_name: client.client_name,
        status: 'Reminder scheduled',
        // In production: result from email/SMS API
      };
    });

    // Log the operation
    await supabaseAdmin
      .from('system_logs')
      .insert({
        operation: 'payment_reminder',
        details: JSON.stringify({
          clients_notified: pendingPayments.length,
          timestamp: new Date().toISOString(),
        }),
      });

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${pendingPayments.length} payment reminders`,
      results,
    });
  } catch (error) {
    console.error('Error in payment reminder function:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
