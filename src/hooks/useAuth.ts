import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Auth error:', err);
        setError(err instanceof Error ? err : new Error('Failed to get session'));
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password.trim(),
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to sign in'),
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, userData: { username: string; full_name: string }) => {
    try {
      setError(null);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password.trim(),
        options: {
          data: {
            username: userData.username.toLowerCase().trim(),
            full_name: userData.full_name.trim(),
          },
        },
      });

      if (signUpError) throw signUpError;

      return { data, error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to sign up'),
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      
      // Clear any cached data
      if (window.queryClient) {
        window.queryClient.clear();
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Force reload the page after successful sign out
      window.location.href = '/';

      return { error: null };
    } catch (err) {
      console.error('Sign out error:', err);
      const error = err instanceof Error ? err : new Error('Failed to sign out');
      setError(error);
      return { error };
    }
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
}