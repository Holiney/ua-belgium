-- UA Belgium Database Schema
-- Виконайте цей SQL у Supabase Dashboard > SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (користувачі)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id BIGINT UNIQUE,
  telegram_username TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  city TEXT DEFAULT 'brussels',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) для profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- PRODUCTS TABLE (товари)
-- =====================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('offer', 'looking')), -- Пропоную / Шукаю
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'negotiable', 'free', 'exchange')),
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  contact_telegram TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS для products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_city ON products(city);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_user_id ON products(user_id);

-- =====================================================
-- FOOD_ITEMS TABLE (їжа)
-- =====================================================
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('offer', 'looking')), -- Пропоную / Шукаю
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'negotiable', 'free')),
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  contact_telegram TEXT,
  contact_phone TEXT,
  delivery_options TEXT[] DEFAULT '{}', -- pickup, delivery, both
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS для food_items
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food items are viewable by everyone" ON food_items
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own food items" ON food_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food items" ON food_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food items" ON food_items
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_food_items_category ON food_items(category);
CREATE INDEX idx_food_items_city ON food_items(city);
CREATE INDEX idx_food_items_type ON food_items(type);
CREATE INDEX idx_food_items_status ON food_items(status);

-- =====================================================
-- RENTALS TABLE (оренда)
-- =====================================================
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('offer', 'looking')), -- Здаю / Шукаю
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  price_period TEXT DEFAULT 'month' CHECK (price_period IN ('day', 'week', 'month')),
  category TEXT NOT NULL, -- apartment, room, house, studio
  city TEXT NOT NULL,
  address TEXT,
  rooms INTEGER,
  area_sqm INTEGER,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  contact_telegram TEXT,
  contact_phone TEXT,
  available_from DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'rented', 'inactive')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS для rentals
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rentals are viewable by everyone" ON rentals
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own rentals" ON rentals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rentals" ON rentals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rentals" ON rentals
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_rentals_category ON rentals(category);
CREATE INDEX idx_rentals_city ON rentals(city);
CREATE INDEX idx_rentals_type ON rentals(type);
CREATE INDEX idx_rentals_status ON rentals(status);

-- =====================================================
-- FAVORITES TABLE (обране)
-- =====================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'food', 'rental')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- RLS для favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTION: Auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_items_updated_at
  BEFORE UPDATE ON food_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at
  BEFORE UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, telegram_id, telegram_username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'first_name', 'Користувач'),
    (NEW.raw_user_meta_data->>'telegram_id')::BIGINT,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'photo_url'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STORAGE BUCKETS (для зображень)
-- =====================================================
-- Виконайте це в Supabase Dashboard > Storage > Create bucket
-- Назва: listings
-- Public: Yes

-- Storage policies (виконайте після створення bucket)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);

-- CREATE POLICY "Anyone can view listing images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'listings');

-- CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'listings' AND
--     auth.role() = 'authenticated'
--   );

-- CREATE POLICY "Users can update own listing images" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'listings' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete own listing images" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'listings' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
