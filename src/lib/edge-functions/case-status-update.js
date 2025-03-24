
// Equal Access - Case Status Update Edge Function
// This Edge Function updates case statuses and sends notifications

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Accept POST requests only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { caseId, newStatus, notifyClient } = req.body;

    if (!caseId || !newStatus) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Update the case status
    const { data: updatedCase, error: updateError } = await supabaseAdmin
      .from('cases')
      .update({ 
        status: newStatus,
        ...(newStatus === 'closed' ? { closed_at: new Date().toISOString() } : {})
      })
      .eq('id', caseId)
      .select('*, clients(first_name, surname, email, phone)');

    if (updateError) {
      console.error('Error updating case status:', updateError);
      return res.status(500).json({ error: 'Failed to update case status' });
    }

    if (!updatedCase || updatedCase.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Create a case note for the status change
    await supabaseAdmin
      .from('case_notes')
      .insert({
        case_id: caseId,
        author_id: req.auth?.id || null, // The authenticated user's ID
        content: `Case status changed to: ${newStatus}`
      });

    // Send notification to client if requested
    if (notifyClient && updatedCase[0].clients) {
      const client = updatedCase[0].clients;
      console.log(`Notification would be sent to ${client.first_name} ${client.surname} at ${client.email}`);
      
      // In a real implementation, this would call a notification service
      // For example, SendGrid for email or Twilio for SMS
    }

    return res.status(200).json({
      success: true,
      message: `Case status updated to ${newStatus}`,
      data: updatedCase[0]
    });
  } catch (error) {
    console.error('Error in case status update function:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
