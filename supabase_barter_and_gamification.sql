-- SQL Migrations for P2P Barter Hub & Gamification

-- 1. Create public.barter_listings Table
CREATE TABLE IF NOT EXISTS public.barter_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_city TEXT NOT NULL,
  item_offered TEXT NOT NULL,
  item_wanted TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for barter_listings
ALTER TABLE public.barter_listings ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policies for barter_listings
CREATE POLICY "Anyone can view active barter listings" ON public.barter_listings
  FOR SELECT USING (true);

CREATE POLICY "Users can create barter listings" ON public.barter_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own barter listings" ON public.barter_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own barter listings" ON public.barter_listings
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Add Gamification Columns to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date DATE DEFAULT CURRENT_DATE;
