
-- Equal Access Legal Aid Management System - Supabase SQL Setup
-- This file contains all the SQL necessary to configure the Supabase backend

-- Enable necessary Postgres extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUMs for the system
CREATE TYPE user_role AS ENUM ('agent', 'admin', 'accountant');
CREATE TYPE case_status AS ENUM ('open', 'closed', 'pending');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'failed');
CREATE TYPE marital_status AS ENUM ('single', 'married');
CREATE TYPE sex AS ENUM ('male', 'female');
CREATE TYPE title AS ENUM ('mr', 'mrs', 'miss', 'ms', 'dr', 'prof');
CREATE TYPE plan_type AS ENUM ('individual', 'family');
CREATE TYPE coverage_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE payment_frequency AS ENUM ('quarterly', 'half-yearly', 'annually');
CREATE TYPE payment_method AS ENUM ('cash', 'ecocash', 'telecash', 'one-wallet', 'debit-order', 'stop-order');

-- Create profiles table (tied to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'agent',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title title NOT NULL,
  surname TEXT NOT NULL,
  first_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  sex sex NOT NULL,
  date_of_birth DATE NOT NULL,
  id_number TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  marital_status marital_status NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  case_status case_status DEFAULT 'pending',
  agent_id UUID REFERENCES profiles(id),
  date_joined DATE DEFAULT CURRENT_DATE,
  form_number TEXT
);

-- Create employers table
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  employee_number TEXT NOT NULL,
  occupation TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Create next_of_kin table
CREATE TABLE next_of_kin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  id_number TEXT NOT NULL,
  relationship TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Create dependants table
CREATE TABLE dependants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  surname TEXT NOT NULL,
  first_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  date_of_birth DATE NOT NULL
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL,
  coverage_tier coverage_tier NOT NULL,
  monthly_amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_frequency payment_frequency NOT NULL,
  bank_name TEXT,
  bank_branch TEXT,
  account_number TEXT,
  account_holder TEXT,
  pay_date DATE
);

-- Create cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  case_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status case_status DEFAULT 'open',
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  lawyer_id UUID REFERENCES profiles(id)
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  reference TEXT NOT NULL
);

-- Create case_notes table for tracking case progress
CREATE TABLE case_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_documents table for storing document references
CREATE TABLE case_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_of_kin ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependants ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" 
  ON profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for clients table
CREATE POLICY "Agents can view their own clients" 
  ON clients FOR SELECT 
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'accountant')
    )
  );

CREATE POLICY "Agents can insert their own clients" 
  ON clients FOR INSERT 
  WITH CHECK (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Agents can update their own clients" 
  ON clients FOR UPDATE 
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for employers table
CREATE POLICY "Agents can view their client's employers" 
  ON employers FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = employers.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND (role = 'admin' OR role = 'accountant')
       ))
    )
  );

CREATE POLICY "Agents can insert their client's employers" 
  ON employers FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = employers.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND role = 'admin'
       ))
    )
  );

CREATE POLICY "Agents can update their client's employers" 
  ON employers FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = employers.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND role = 'admin'
       ))
    )
  );

-- Similar policies for next_of_kin, dependants and subscriptions tables
-- Next of Kin policies
CREATE POLICY "Agents can view their client's next of kin" 
  ON next_of_kin FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = next_of_kin.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND (role = 'admin' OR role = 'accountant')
       ))
    )
  );

CREATE POLICY "Agents can insert their client's next of kin" 
  ON next_of_kin FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = next_of_kin.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND role = 'admin'
       ))
    )
  );

CREATE POLICY "Agents can update their client's next of kin" 
  ON next_of_kin FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = next_of_kin.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND role = 'admin'
       ))
    )
  );

-- Dependants policies
CREATE POLICY "Agents can view their client's dependants" 
  ON dependants FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = dependants.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND (role = 'admin' OR role = 'accountant')
       ))
    )
  );

CREATE POLICY "Agents can insert their client's dependants" 
  ON dependants FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = dependants.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND role = 'admin'
       ))
    )
  );

CREATE POLICY "Agents can update their client's dependants" 
  ON dependants FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = dependants.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND role = 'admin'
       ))
    )
  );

-- Subscriptions policies
CREATE POLICY "Agents can view their client's subscriptions" 
  ON subscriptions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = subscriptions.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND (role = 'admin' OR role = 'accountant')
       ))
    )
  );

CREATE POLICY "Agents can insert their client's subscriptions" 
  ON subscriptions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = subscriptions.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND role = 'admin'
       ))
    )
  );

CREATE POLICY "Agents can update their client's subscriptions" 
  ON subscriptions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = subscriptions.client_id AND 
      (clients.agent_id = auth.uid() OR
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE id = auth.uid() AND (role = 'admin' OR role = 'accountant')
       ))
    )
  );

-- Create policies for cases table
CREATE POLICY "Admins can view all cases" 
  ON cases FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Agents can view their client's cases" 
  ON cases FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = cases.client_id AND clients.agent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert cases" 
  ON cases FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update cases" 
  ON cases FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for payments table
CREATE POLICY "Accountants can view all payments" 
  ON payments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'accountant')
    )
  );

CREATE POLICY "Agents can view their client's payments" 
  ON payments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = payments.client_id AND clients.agent_id = auth.uid()
    )
  );

CREATE POLICY "Accountants can insert payments" 
  ON payments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'accountant')
    )
  );

CREATE POLICY "Accountants can update payments" 
  ON payments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'accountant')
    )
  );

-- Case notes policies
CREATE POLICY "Admins can view all case notes" 
  ON case_notes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Agents can view case notes for their clients" 
  ON case_notes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      JOIN clients ON clients.id = cases.client_id
      WHERE cases.id = case_notes.case_id AND clients.agent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert case notes" 
  ON case_notes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for case documents
-- Note: This would be done through the Supabase UI or API, not SQL directly
-- CREATE POLICY for document access in storage will be similar to case_documents table

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_client_summary(client_uuid UUID)
RETURNS TABLE (
  client_id UUID,
  full_name TEXT,
  id_number TEXT,
  case_count BIGINT,
  payment_status TEXT,
  total_paid DECIMAL,
  subscription_plan TEXT,
  agent_name TEXT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    c.id as client_id,
    c.title || '. ' || c.first_name || ' ' || c.surname as full_name,
    c.id_number,
    COUNT(DISTINCT cs.id) as case_count,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM payments p 
        WHERE p.client_id = c.id AND p.status = 'pending'
      ) THEN 'Pending'
      WHEN NOT EXISTS (
        SELECT 1 FROM payments p 
        WHERE p.client_id = c.id
      ) THEN 'No Payments'
      ELSE 'Paid'
    END as payment_status,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'paid'), 0) as total_paid,
    COALESCE(s.plan_type || ' - ' || s.coverage_tier, 'No Plan') as subscription_plan,
    COALESCE(pr.first_name || ' ' || pr.last_name, 'Unassigned') as agent_name
  FROM clients c
  LEFT JOIN cases cs ON c.id = cs.client_id
  LEFT JOIN payments p ON c.id = p.client_id
  LEFT JOIN subscriptions s ON c.id = s.client_id
  LEFT JOIN profiles pr ON c.agent_id = pr.id
  WHERE c.id = client_uuid
  GROUP BY c.id, s.plan_type, s.coverage_tier, pr.first_name, pr.last_name;
$$;

-- Create views for common queries
CREATE VIEW client_payment_status AS
SELECT
  c.id as client_id,
  c.first_name || ' ' || c.surname as client_name,
  c.id_number,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'paid'), 0) as total_paid,
  COALESCE(COUNT(p.id) FILTER (WHERE p.status = 'pending'), 0) as pending_payments,
  COALESCE(s.monthly_amount, 0) as monthly_fee,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM payments WHERE client_id = c.id) THEN 'No Payments'
    WHEN EXISTS (SELECT 1 FROM payments WHERE client_id = c.id AND status = 'pending') THEN 'Pending'
    ELSE 'Paid'
  END as payment_status
FROM clients c
LEFT JOIN payments p ON c.id = p.client_id
LEFT JOIN subscriptions s ON c.id = s.client_id
GROUP BY c.id, s.monthly_amount;

-- Create Edge Function for sending payment reminders
-- Note: This would be done through the Supabase UI or API, not SQL directly
-- The function would query clients with pending payments and send reminders

-- Insert initial admin user (optional - usually done via the app)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
VALUES (
  uuid_generate_v4(),
  'admin@equalaccess.com',
  crypt('securepassword', gen_salt('bf')),
  now(),
  'authenticated'
) ON CONFLICT DO NOTHING;

-- Reference this user in the profiles table
INSERT INTO profiles (id, email, role, first_name, last_name)
SELECT id, email, 'admin', 'System', 'Administrator'
FROM auth.users
WHERE email = 'admin@equalaccess.com'
ON CONFLICT DO NOTHING;

-- Create trigger functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at field
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
