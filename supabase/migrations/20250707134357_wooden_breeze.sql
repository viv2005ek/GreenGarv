-- GreenGARV Database Setup for Supabase
-- Copy and paste these commands into your Supabase SQL Editor

-- 1. Enable Row Level Security on auth.users (if not already enabled)
-- This is usually enabled by default in Supabase

-- 2. Create user_scores table for tracking individual user metrics
CREATE TABLE IF NOT EXISTS user_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  eco_score integer DEFAULT 0 CHECK (eco_score >= 0 AND eco_score <= 100),
  co2_saved numeric(10,2) DEFAULT 0.00,
  points_earned integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  weekly_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_scores
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and modify their own scores
CREATE POLICY "Users can manage own scores" ON user_scores
  FOR ALL USING (auth.uid() = user_id);

-- 3. Create carbon_activities table for tracking user's carbon footprint activities
CREATE TABLE IF NOT EXISTS carbon_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('vehicle', 'flight', 'electricity', 'shipping')),
  distance_value numeric(10,2),
  co2_kg numeric(10,3) NOT NULL,
  activity_date timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on carbon_activities
ALTER TABLE carbon_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own activities
CREATE POLICY "Users can manage own activities" ON carbon_activities
  FOR ALL USING (auth.uid() = user_id);

-- 4. Create scanned_products table for storing product scan history
CREATE TABLE IF NOT EXISTS scanned_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  brand text,
  barcode text,
  eco_score integer CHECK (eco_score >= 0 AND eco_score <= 100),
  co2_impact numeric(10,2),
  scan_date timestamptz DEFAULT now(),
  product_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on scanned_products
ALTER TABLE scanned_products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own scanned products
CREATE POLICY "Users can manage own scanned products" ON scanned_products
  FOR ALL USING (auth.uid() = user_id);

-- 5. Create global_stats table for homepage statistics (admin managed)
CREATE TABLE IF NOT EXISTS global_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  co2_saved numeric(12,2) DEFAULT 0.00,
  trees_planted integer DEFAULT 0,
  users_active integer DEFAULT 0,
  waste_reduced numeric(12,2) DEFAULT 0.00,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on global_stats
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read global stats, only service role can modify
CREATE POLICY "Anyone can read global stats" ON global_stats
  FOR SELECT USING (true);

CREATE POLICY "Only service role can modify global stats" ON global_stats
  FOR ALL USING (auth.role() = 'service_role');

-- 6. Create achievements table for user achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text DEFAULT '🏆',
  requirement_type text NOT NULL,
  requirement_value numeric(10,2) NOT NULL,
  points_reward integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read achievements
CREATE POLICY "Anyone can read achievements" ON achievements
  FOR SELECT USING (true);

-- 7. Create user_achievements table for tracking user's unlocked achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own achievements
CREATE POLICY "Users can see own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- 8. Create recycling_centers table for storing recycling center data
CREATE TABLE IF NOT EXISTS recycling_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  phone text,
  website text,
  accepted_materials text[] DEFAULT '{}',
  operating_hours jsonb DEFAULT '{}'::jsonb,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on recycling_centers
ALTER TABLE recycling_centers ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read recycling centers
CREATE POLICY "Anyone can read recycling centers" ON recycling_centers
  FOR SELECT USING (true);

-- 9. Insert sample data

-- Insert initial global stats
INSERT INTO global_stats (co2_saved, trees_planted, users_active, waste_reduced) 
VALUES (15420.50, 3240, 12580, 8960.75)
ON CONFLICT DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, points_reward) VALUES
('Carbon Saver', 'Save 100kg of CO₂', '🌍', 'co2_saved', 100, 500),
('Eco Warrior', 'Maintain a 30-day streak', '⚡', 'streak_days', 30, 1000),
('Scanner Pro', 'Scan 50 products', '📱', 'products_scanned', 50, 300),
('Recycling Hero', 'Find 10 recycling centers', '♻️', 'centers_found', 10, 200),
('Green Starter', 'Complete your first week', '🌱', 'days_active', 7, 100)
ON CONFLICT (name) DO NOTHING;

-- Insert sample recycling centers (you can add more based on your location)
INSERT INTO recycling_centers (name, address, latitude, longitude, phone, accepted_materials, verified) VALUES
('Green Earth Recycling', '123 Eco Street, Green City', 40.7128, -74.0060, '+1-555-0123', ARRAY['plastic', 'paper', 'glass', 'metal'], true),
('EcoWaste Solutions', '456 Recycle Ave, Eco Town', 40.7589, -73.9851, '+1-555-0456', ARRAY['electronics', 'batteries', 'plastic'], true),
('City Recycling Hub', '789 Green Blvd, Sustainability City', 40.7831, -73.9712, '+1-555-0789', ARRAY['paper', 'cardboard', 'glass'], true)
ON CONFLICT DO NOTHING;

-- 10. Create functions for automatic user score initialization
CREATE OR REPLACE FUNCTION initialize_user_score()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_scores (user_id, eco_score, co2_saved, points_earned, streak_days)
  VALUES (NEW.id, 50, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize user score when new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_score();

-- 11. Create function to update user scores based on activities
CREATE OR REPLACE FUNCTION update_user_eco_score(user_uuid uuid)
RETURNS void AS $$
DECLARE
  total_co2 numeric;
  activity_count integer;
  new_score integer;
BEGIN
  -- Calculate total CO2 saved and activity count
  SELECT COALESCE(SUM(co2_kg), 0), COUNT(*)
  INTO total_co2, activity_count
  FROM carbon_activities
  WHERE user_id = user_uuid;
  
  -- Calculate new eco score (simple algorithm - you can make this more sophisticated)
  new_score := LEAST(100, GREATEST(0, 50 + (total_co2 * 2)::integer + (activity_count * 5)));
  
  -- Update user score
  UPDATE user_scores 
  SET 
    eco_score = new_score,
    co2_saved = total_co2,
    updated_at = now()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_activities_user_id ON carbon_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_activities_date ON carbon_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_scanned_products_user_id ON scanned_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_recycling_centers_location ON recycling_centers(latitude, longitude);

-- 13. Create a view for user dashboard data
CREATE OR REPLACE VIEW user_dashboard_data AS
SELECT 
  us.user_id,
  us.eco_score,
  us.co2_saved,
  us.points_earned,
  us.streak_days,
  COUNT(DISTINCT ca.id) as total_activities,
  COUNT(DISTINCT sp.id) as total_scans,
  COUNT(DISTINCT ua.id) as total_achievements
FROM user_scores us
LEFT JOIN carbon_activities ca ON us.user_id = ca.user_id
LEFT JOIN scanned_products sp ON us.user_id = sp.user_id
LEFT JOIN user_achievements ua ON us.user_id = ua.user_id
GROUP BY us.user_id, us.eco_score, us.co2_saved, us.points_earned, us.streak_days;

-- Enable RLS on the view
ALTER VIEW user_dashboard_data SET (security_invoker = true);

-- That's it! Your database is now ready for GreenGARV
-- The app will automatically create user scores when users sign up
-- and update eco scores based on their activities.