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

// ── STORAGE HELPERS ────────────────────────────────────────────────

/**
 * Upload a file to any Supabase Storage bucket and retrieve its public URL
 */
export const uploadStorageFile = async (
  bucket: 'kyc-documents' | 'post-media' | 'avatars' | 'dispute-evidence',
  filePath: string,
  file: File
): Promise<{ path: string; publicUrl: string }> => {
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true
  });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { path: data.path, publicUrl };
};

/**
 * Upload KYC document file for an artisan
 */
export const uploadKycDocument = async (
  userId: string,
  docType: 'government_id' | 'skill_certificate' | 'passport_photo',
  file: File
) => {
  const fileExt = file.name.split('.').pop() || 'png';
  const filePath = `${userId}/${docType}_${Date.now()}.${fileExt}`;
  return uploadStorageFile('kyc-documents', filePath, file);
};

/**
 * Upload post attachment image
 */
export const uploadPostMedia = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop() || 'png';
  const filePath = `${userId}/posts/${Date.now()}.${fileExt}`;
  return uploadStorageFile('post-media', filePath, file);
};

/**
 * Upload profile avatar photo
 */
export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop() || 'png';
  const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;
  return uploadStorageFile('avatars', filePath, file);
};

/**
 * Upload dispute evidence photo
 */
export const uploadDisputeEvidence = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop() || 'png';
  const filePath = `${userId}/disputes/${Date.now()}.${fileExt}`;
  return uploadStorageFile('dispute-evidence', filePath, file);
};


