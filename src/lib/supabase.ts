import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Custom fetch implementation with retries and timeout
const customFetch = async (url: string, options: RequestInit = {}) => {
  const MAX_RETRIES = 3;
  const INITIAL_RETRY_DELAY = 1000;
  const MAX_RETRY_DELAY = 5000;
  const TIMEOUT = 10000; // 10 seconds timeout

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  const fetchWithTimeout = async () => {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fetchWithTimeout();
    } catch (error) {
      lastError = error;
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, attempt),
          MAX_RETRY_DELAY
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'park-adventure-planner-auth'
    },
    global: {
      headers: {
        'x-application-name': 'park-adventure-planner'
      }
    },
    db: {
      schema: 'public'
    },
    httpOptions: {
      fetch: customFetch
    }
  }
);

// Handle auth state changes
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    // Clear local storage items related to our app
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('park-adventure-planner-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear query cache
    if (window.queryClient) {
      window.queryClient.clear();
    }

    // Reload the page to ensure a clean state
    window.location.reload();
  }
});