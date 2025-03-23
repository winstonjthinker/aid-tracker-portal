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
  createUserAccount: (email: string, password: string, firstName: string, lastName: string, role: 'agent' | 'admin' | 'accountant') => Promise<void>;
  signOut: () => Promise<void>;
};

const DEFAULT_ADMIN_EMAIL = 'winston@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'monalisah1996';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isUsingMockSupabase = () => {
    return supabase.supabaseUrl === 'https://placeholder-url.supabase.co';
  };

  useEffect(() => {
    const setupAuth = async () => {
      if (isUsingMockSupabase()) {
        console.log('Using mock auth setup with default admin credentials');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profile);
      }

      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            setProfile(profile);
          } else {
            setProfile(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      if (isUsingMockSupabase()) {
        if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
          const mockUser = {
            id: 'admin-user-id',
            email: DEFAULT_ADMIN_EMAIL,
            // Other user properties would go here
          } as User;
          
          const mockProfile = {
            id: 'admin-user-id',
            email: DEFAULT_ADMIN_EMAIL,
            role: 'admin' as const,
            first_name: 'Winston',
            last_name: 'Admin'
          };
          
          setUser(mockUser);
          setProfile(mockProfile);
          
          toast.success("Welcome back, Winston!", {
            description: "You've successfully signed in.",
          });
          
          return;
        } else {
          toast.error("Invalid credentials", {
            description: "Please check your email and password.",
          });
          throw new Error('Invalid credentials');
        }
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error("Authentication failed", {
          description: error.message,
        });
        throw error;
      }
      
      toast.success("Welcome back!", {
        description: "You've successfully signed in.",
      });
    } catch (error) {
      console.error('Error signing in:', error);
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
      
      if (isUsingMockSupabase()) {
        toast.success("Account created successfully", {
          description: `${firstName} ${lastName} (${role}) has been added.`,
        });
        return;
      }
      
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
        toast.error("Account creation failed", {
          description: error.message,
        });
        throw error;
      }
      
      if (data.user) {
        await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: email,
            role: role,
            first_name: firstName,
            last_name: lastName,
          }
        ]);
        
        toast.success("Account created", {
          description: `${firstName} ${lastName} (${role}) has been added.`,
        });
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
      
      if (isUsingMockSupabase()) {
        setUser(null);
        setProfile(null);
        setSession(null);
        toast.success("Signed out", {
          description: "You've been successfully signed out.",
        });
        return;
      }
      
      await supabase.auth.signOut();
      toast.success("Signed out", {
        description: "You've been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Error signing out", {
        description: "An error occurred while signing out.",
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
