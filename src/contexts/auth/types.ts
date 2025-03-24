
import { User, Session } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  email: string;
  role: 'agent' | 'admin' | 'accountant';
  first_name: string;
  last_name: string;
}

export type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: 'agent' | 'admin' | 'accountant') => Promise<void>;
  createUserAccount: (email: string, password: string, firstName: string, lastName: string, role: 'agent' | 'admin' | 'accountant') => Promise<void>;
  signOut: () => Promise<void>;
};
