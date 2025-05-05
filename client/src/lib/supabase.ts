import { createClient } from '@supabase/supabase-js';

// For development purposes, use a fallback URL and key to avoid errors
// These will be replaced with the actual values from the server when available
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder_key';

// Create client with fallback values initially and additional options
export const supabase = createClient(fallbackUrl, fallbackKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Load actual configuration from server
(async function loadSupabaseConfig() {
  try {
    const response = await fetch('/api/supabase-config');
    if (!response.ok) {
      throw new Error('Failed to fetch Supabase configuration');
    }

    const config = await response.json();
    
    if (config.supabaseUrl && config.supabaseKey) {
      // Create a new client with proper configuration
      const newClient = createClient(config.supabaseUrl, config.supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      
      // Replace the existing client with the new one
      Object.assign(supabase, newClient);
      
      console.log('Supabase client initialized successfully with server config');
    } else {
      console.error('Invalid Supabase configuration received from server');
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
  }
})();