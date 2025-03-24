
# Equal Access - Supabase Backend Configuration

This document outlines the complete Supabase configuration for the Equal Access Legal Aid Management System.

## 1. Authentication Setup

Equal Access uses Supabase Auth for user authentication with the following configuration:

- **Email/Password Authentication**: Enabled for all staff members
- **Email Confirmations**: Required for new registrations
- **User Management**: Admin-controlled through the application
- **User Roles**: Implemented using custom claims and user metadata:
  - Admin: System administrators with full access
  - Agent: Legal aid representatives who register and manage clients
  - Accountant: Finance staff who manage payments and subscriptions

## 2. Database Schema

The database schema is designed to support all aspects of the legal aid management system:

- **profiles**: User profiles linked to Supabase Auth
- **clients**: Client information managed by agents
- **employers**: Client employment details
- **next_of_kin**: Client's next of kin information
- **dependants**: Client's dependants information
- **subscriptions**: Client subscription details and payment plans
- **cases**: Legal cases for clients
- **payments**: Payment records and history
- **case_notes**: Notes and updates on cases
- **case_documents**: References to case-related documents

## 3. Row Level Security (RLS)

RLS policies are implemented to enforce appropriate data access:

- **Agents** can only view and manage their own clients and associated data
- **Admins** have full access to all data
- **Accountants** can view all client data but can only modify payment information

## 4. Edge Functions

Equal Access uses Supabase Edge Functions for certain operations:

1. **Payment Reminder System**: Automatically sends reminders to clients with pending payments
2. **Case Status Updates**: Handles case status changes and notifications

## 5. Storage Buckets

Supabase Storage is used for document management:

- **case-documents**: For legal documents and case files
- **client-documents**: For client identification and verification documents

## 6. Scheduled Functions

Database jobs are scheduled for regular operations:

- **Daily Payment Status Check**: Updates payment statuses based on due dates
- **Weekly Client Report Generator**: Creates summary reports for administrators

## 7. Deployment Instructions

To deploy this configuration to a new Supabase project:

1. Create a new Supabase project
2. Run the SQL setup script (supabase-setup.sql) in the SQL Editor
3. Deploy the Edge Functions from the src/lib/edge-functions directory
4. Configure Storage buckets with appropriate RLS policies
5. Set environment variables in your application:
   - VITE_SUPABASE_URL=your-project-url
   - VITE_SUPABASE_ANON_KEY=your-anon-key

## 8. Next Steps After Configuration

After configuring Supabase:

1. Create an initial admin user through the Supabase dashboard or application
2. Verify RLS policies are working correctly with tests
3. Test Edge Functions to ensure they operate as expected
4. Set up recurring database jobs for maintenance tasks

## 9. Security Considerations

- All JWT tokens have a short expiration time
- Service role key is only used in secure server environments
- RLS policies are tested thoroughly to prevent data leakage
- Regular security audits are scheduled

## 10. Maintenance

- Regular backups of the database are recommended
- Monitor Supabase usage and adjust plans as needed
- Keep track of Supabase version updates

For additional assistance or custom configurations, consult the Supabase documentation or contact the development team.
