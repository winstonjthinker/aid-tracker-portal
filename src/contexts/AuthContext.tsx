
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

type UserProfile = {
  id: string;
  email: string;
  role: 'agent' | 'admin' | 'accountant';
  first_name: string;
  last_name: string;
}

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: 'agent' | 'admin' | 'accountant') => Promise<void>;
  createUserAccount: (email: string, password: string, firstName: string, lastName: string, role: 'agent' | 'admin' | 'accountant') => Promise<void>;
  signOut: () => Promise<void>;
};

const DEFAULT_ADMIN_EMAIL = 'winstonjthinkersavens@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'winston28monalisah1997';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        console.log('Setting up auth and checking session...');
        
        // First set up the auth state listener BEFORE checking for existing session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            console.log('Auth state changed, event:', _event);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              console.log('Fetching profile for user:', session.user.id);
              try {
                const { data: profile, error } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                
                if (error) {
                  console.error('Error fetching profile:', error);
                } else {
                  console.log('Profile fetched successfully:', profile);
                  setProfile(profile);
                }
              } catch (err) {
                console.error('Exception in profile fetch:', err);
              }
            } else {
              setProfile(null);
            }
          }
        );

        // THEN check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('Session exists, fetching profile for user:', session.user.id);
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile on init:', error);
          } else {
            console.log('Profile fetched successfully on init:', profile);
            setProfile(profile);
          }
        }

        setLoading(false);

        return () => {
          console.log('Cleaning up auth subscription');
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Critical error in auth setup:', err);
        setLoading(false);
      }
    };

    setupAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Authentication failed:', error.message);
        toast.error("Authentication failed", {
          description: error.message,
        });
        throw error;
      }
      
      console.log('Sign in successful:', data);
      toast.success("Welcome to Equal Access!", {
        description: "You've successfully signed in.",
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    role: 'agent' | 'admin' | 'accountant'
  ) => {
    try {
      setLoading(true);
      console.log('Creating new user account:', email, role);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });
      
      if (error) {
        console.error('Account creation failed:', error.message);
        toast.error("Account creation failed", {
          description: error.message,
        });
        throw error;
      }
      
      if (data.user) {
        console.log('User created, now creating profile:', data.user.id);
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: email,
            role: role,
            first_name: firstName,
            last_name: lastName,
          }
        ]);
        
        if (profileError) {
          console.error('Profile creation failed:', profileError);
          toast.error("Profile creation failed", {
            description: profileError.message,
          });
        } else {
          console.log('Profile created successfully');
          toast.success("Account created", {
            description: `Welcome to Equal Access, ${firstName}!`,
          });
        }
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createUserAccount = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    role: 'agent' | 'admin' | 'accountant'
  ) => {
    try {
      setLoading(true);
      console.log('Admin creating user account:', email, role);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      });
      
      if (error) {
        console.error('Account creation failed:', error.message);
        toast.error("Account creation failed", {
          description: error.message,
        });
        throw error;
      }
      
      if (data.user) {
        console.log('User created by admin, now creating profile:', data.user.id);
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: email,
            role: role,
            first_name: firstName,
            last_name: lastName,
          }
        ]);
        
        if (profileError) {
          console.error('Profile creation failed:', profileError);
          toast.error("Profile creation failed", {
            description: profileError.message,
          });
        } else {
          console.log('User account created successfully by admin');
          toast.success("Account created", {
            description: `${firstName} ${lastName} (${role}) has been added to Equal Access.`,
          });
        }
      }
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out user');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast.error("Error signing out", {
          description: "An error occurred while signing out: " + error.message,
        });
        throw error;
      }
      
      console.log('Sign out successful');
      toast.success("Signed out", {
        description: "You've been successfully signed out of Equal Access.",
      });
    } catch (error) {
      console.error('Exception during sign out:', error);
      toast.error("Error signing out", {
        description: "An unexpected error occurred while signing out.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        createUserAccount,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
