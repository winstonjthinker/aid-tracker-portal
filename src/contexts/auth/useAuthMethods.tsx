
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useAuthMethods(setLoading: (loading: boolean) => void) {
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
      
      // Use the signUp method instead of directly creating admin users
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

  return {
    signIn,
    signUp,
    createUserAccount,
    signOut,
  };
}
