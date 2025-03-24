
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from './types';
import { toast } from 'sonner';

export function useAuthState() {
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

  return {
    user,
    profile,
    session,
    loading,
    setLoading,
  };
}
