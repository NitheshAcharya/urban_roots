-- Supabase Schema for UrbanRoots

-- 1. Users Extension (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Plants
CREATE TABLE public.user_plants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  plant_name TEXT NOT NULL,
  species TEXT,
  watering_frequency_days INTEGER NOT NULL DEFAULT 2,
  last_watered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  health_status TEXT DEFAULT 'Good',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Marketplace Orders
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  total_amount_inr DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Expert Bookings
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  expert_name TEXT NOT NULL,
  expert_id INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  consultation_type TEXT NOT NULL,
  problem_description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow users to read and write only their own data
CREATE POLICY "Users can edit own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own plants" ON public.user_plants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id);

-- 5. Plant Encyclopedia Suggestions
CREATE TABLE public.plant_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plant_id INTEGER NOT NULL,
  plant_name TEXT NOT NULL,
  suggested_field TEXT NOT NULL,
  suggested_value TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.plant_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert suggestions" ON public.plant_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view pending suggestions" ON public.plant_suggestions FOR SELECT USING (true);
CREATE POLICY "Anyone can update suggestions" ON public.plant_suggestions FOR UPDATE USING (true);

-- 6. AI Scans
CREATE TABLE public.ai_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  mode TEXT NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert scans" ON public.ai_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view scans" ON public.ai_scans FOR SELECT USING (true);

-- 7. Chat History
CREATE TABLE public.chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert chat history" ON public.chat_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view chat history" ON public.chat_history FOR SELECT USING (true);
