import { useQuery, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export function useProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery(
    ['profile', userId],
    async () => {
      if (!userId) return null;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error instanceof PostgrestError) {
            switch (error.code) {
              case '23505': // unique_violation
                throw new Error('Profile already exists');
              case '23503': // foreign_key_violation
                throw new Error('Invalid user reference');
              case '42703': // undefined_column
                throw new Error('Database schema mismatch');
              default:
                console.error('Profile fetch error:', error);
                throw new Error('Database error occurred');
            }
          }
          throw error;
        }

        return data;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch') || error.message === 'Request timeout') {
            throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
          }
          if (error.message.includes('AbortError')) {
            throw new Error('Request timed out. Please try again.');
          }
          throw error;
        }
        throw new Error('An unexpected error occurred while fetching profile data');
      }
    },
    {
      enabled: !!userId,
      staleTime: 300000, // 5 minutes
      cacheTime: 3600000, // 1 hour
      retry: (failureCount, error) => {
        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.message.includes('Profile already exists') ||
              error.message.includes('Invalid user reference') ||
              error.message.includes('Database schema mismatch')) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
      onError: (error) => {
        console.error('Profile query error:', error);
      },
      onSuccess: (data) => {
        if (data) {
          queryClient.setQueryData(['profile', data.id], data);
        }
      }
    }
  );
}