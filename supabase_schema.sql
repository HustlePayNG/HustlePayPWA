-- ====================================================================
-- HUSTLEPAY SINGLE-ACCOUNT UNIFIED DATABASE SCHEMA FOR SUPABASE
-- Safe & Idempotent (Can be executed multiple times without errors)
-- ====================================================================

-- Enable PostGIS & UUID extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. UNIFIED PROFILES TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone_number TEXT,
  
  -- Account Dual-Role Flags
  is_artisan BOOLEAN NOT NULL DEFAULT false,
  active_mode_preference TEXT NOT NULL DEFAULT 'seeker',
  is_online BOOLEAN NOT NULL DEFAULT false,
  
  -- Artisan Business Details
  business_name TEXT,
  category_id TEXT,
  bio TEXT,
  rating_average NUMERIC(3,2) DEFAULT 5.00,
  rating_count INT DEFAULT 0,
  completed_jobs_count INT DEFAULT 0,
  years_experience INT DEFAULT 1,
  
  -- Artisan Pricing & Billing
  base_rate NUMERIC(12,2) DEFAULT 10000.00,
  callout_fee NUMERIC(12,2) DEFAULT 3000.00,
  rate_type TEXT DEFAULT 'per_service',
  
  -- KYC Verification
  kyc_status TEXT NOT NULL DEFAULT 'none',
  kyc_documents JSONB DEFAULT '{}'::jsonb,
  
  -- Working Availability Schedule
  availability JSONB DEFAULT '[
    {"weekday":"Monday","enabled":true,"startTime":"08:00","endTime":"18:00"},
    {"weekday":"Tuesday","enabled":true,"startTime":"08:00","endTime":"18:00"},
    {"weekday":"Wednesday","enabled":true,"startTime":"08:00","endTime":"18:00"},
    {"weekday":"Thursday","enabled":true,"startTime":"08:00","endTime":"18:00"},
    {"weekday":"Friday","enabled":true,"startTime":"08:00","endTime":"18:00"},
    {"weekday":"Saturday","enabled":true,"startTime":"09:00","endTime":"16:00"},
    {"weekday":"Sunday","enabled":false,"startTime":"09:00","endTime":"16:00"}
  ]'::jsonb,

  -- Spatial Location
  location GEOMETRY(Point, 4326),
  address TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. SINGLE WALLET & TRANSACTIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'NGN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  reference TEXT NOT NULL UNIQUE,
  description TEXT,
  booking_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. BOOKINGS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL UNIQUE,
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  
  callout_fee NUMERIC(12,2) NOT NULL DEFAULT 3000.00,
  estimated_amount NUMERIC(12,2) NOT NULL DEFAULT 10000.00,
  final_amount NUMERIC(12,2),
  platform_fee NUMERIC(12,2),
  artisan_payout NUMERIC(12,2),
  
  description TEXT,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. MARKETPLACE JOB OPENINGS & PROPOSALS ─────────────────────────
CREATE TABLE IF NOT EXISTS public.marketplace_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seeker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seeker_name TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_id TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC(12,2) NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.marketplace_jobs(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artisan_name TEXT NOT NULL,
  artisan_avatar TEXT,
  bid_price NUMERIC(12,2) NOT NULL,
  cover_note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, artisan_id)
);

-- ── 5. SOCIAL SHOWCASE POSTS & COMMENTS ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.artisan_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  caption TEXT NOT NULL,
  image_url TEXT,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.artisan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.artisan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. ROW LEVEL SECURITY (RLS) POLICIES ────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to prevent 42710 collision errors
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view bookings they are part of" ON public.bookings;
DROP POLICY IF EXISTS "Bookings viewable by seeker or artisan" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Seekers create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update relevant bookings" ON public.bookings;
DROP POLICY IF EXISTS "Participants update bookings" ON public.bookings;

DROP POLICY IF EXISTS "Marketplace jobs viewable by all" ON public.marketplace_jobs;
DROP POLICY IF EXISTS "Jobs viewable by everyone" ON public.marketplace_jobs;
DROP POLICY IF EXISTS "Seekers create jobs" ON public.marketplace_jobs;
DROP POLICY IF EXISTS "Seekers post jobs" ON public.marketplace_jobs;

DROP POLICY IF EXISTS "Proposals viewable by job seeker or artisan" ON public.job_proposals;
DROP POLICY IF EXISTS "Artisans insert proposals" ON public.job_proposals;
DROP POLICY IF EXISTS "Artisans submit proposals" ON public.job_proposals;

-- Create Policies
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Bookings viewable by seeker or artisan" ON public.bookings 
  FOR SELECT USING (auth.uid() = seeker_id OR auth.uid() = artisan_id);

CREATE POLICY "Seekers create bookings" ON public.bookings 
  FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Participants update bookings" ON public.bookings 
  FOR UPDATE USING (auth.uid() = seeker_id OR auth.uid() = artisan_id);

CREATE POLICY "Jobs viewable by everyone" ON public.marketplace_jobs FOR SELECT USING (true);
CREATE POLICY "Seekers post jobs" ON public.marketplace_jobs FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Artisans submit proposals" ON public.job_proposals FOR INSERT WITH CHECK (
  auth.uid() = artisan_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_artisan = true)
);

-- ── 7. UNIFIED AUTO USER CREATION TRIGGER ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_artisan, active_mode_preference)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'HustlePay User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/adventurer/svg?seed=' || NEW.id),
    false,
    'seeker'
  );

  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 50000.00);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 8. FUNCTION: UPGRADE SEEKER TO ARTISAN ──────────────────────────
CREATE OR REPLACE FUNCTION public.become_artisan(
  p_business_name TEXT,
  p_category_id TEXT,
  p_bio TEXT,
  p_years_experience INT,
  p_base_rate NUMERIC,
  p_callout_fee NUMERIC,
  p_rate_type TEXT,
  p_kyc_documents JSONB
)
RETURNS public.profiles AS $$
DECLARE
  v_updated_profile public.profiles;
BEGIN
  UPDATE public.profiles
  SET 
    is_artisan = true,
    active_mode_preference = 'artisan',
    kyc_status = 'approved',
    business_name = p_business_name,
    category_id = p_category_id,
    bio = p_bio,
    years_experience = p_years_experience,
    base_rate = p_base_rate,
    callout_fee = p_callout_fee,
    rate_type = p_rate_type,
    kyc_documents = p_kyc_documents,
    updated_at = NOW()
  WHERE id = auth.uid()
  RETURNING * INTO v_updated_profile;

  RETURN v_updated_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 9. GEO-DISTANCE NEARBY ARTISANS SEARCH ──────────────────────────
CREATE OR REPLACE FUNCTION get_nearby_artisans(
  lat DOUBLE PRECISION,
  long DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 10000
)
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.profiles
  WHERE is_artisan = true
    AND is_online = true
    AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(long, lat), 4326), radius_meters);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 10. STORAGE BUCKETS & RLS POLICIES ────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('kyc-documents', 'kyc-documents', false),
  ('post-media', 'post-media', true),
  ('avatars', 'avatars', true),
  ('dispute-evidence', 'dispute-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for post media, avatars, and dispute evidence
CREATE POLICY "Public Read Access for Post Media" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Public Read Access for Avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Public Read Access for Dispute Evidence" ON storage.objects
  FOR SELECT USING (bucket_id = 'dispute-evidence');

-- Upload policies for authenticated users
CREATE POLICY "Authenticated Users Upload Post Media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Users Upload Avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Users Upload Dispute Evidence" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'dispute-evidence' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Users Upload KYC Documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users Read Own KYC Documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ── 11. DISPUTES TABLE & POLICIES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  booking_ref TEXT NOT NULL,
  complainant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  respondent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  resolution_outcome TEXT,
  refund_amount NUMERIC(12,2),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_complainant ON public.disputes(complainant_id);
CREATE INDEX IF NOT EXISTS idx_disputes_respondent ON public.disputes(respondent_id);
CREATE INDEX IF NOT EXISTS idx_disputes_booking ON public.disputes(booking_id);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view disputes they are party to" ON public.disputes
  FOR SELECT USING (auth.uid() = complainant_id OR auth.uid() = respondent_id);

CREATE POLICY "Users create disputes for their bookings" ON public.disputes
  FOR INSERT WITH CHECK (auth.uid() = complainant_id);

CREATE POLICY "Users update disputes they are party to" ON public.disputes
  FOR UPDATE USING (auth.uid() = complainant_id OR auth.uid() = respondent_id);


