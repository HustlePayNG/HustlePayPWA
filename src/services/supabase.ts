import { createClient } from '@supabase/supabase-js';

// Load keys from Vite environment variables (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qcgrkcsrnnuvdcfcfvem.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// ── AUTH HELPERS ──────────────────────────────────────────────────

/**
 * Trigger Google OAuth Sign-In flow
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
      }
    }
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out current user
 */
export const signOutSupabase = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get currently authenticated session user
 */
export const getSupabaseUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
