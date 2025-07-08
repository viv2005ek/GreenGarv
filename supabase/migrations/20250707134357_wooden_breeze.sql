-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text DEFAULT '🏆'::text,
  requirement_type text NOT NULL,
  requirement_value numeric NOT NULL,
  points_reward integer DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.carbon_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  activity_type text NOT NULL CHECK (activity_type = ANY (ARRAY['vehicle'::text, 'flight'::text, 'electricity'::text, 'shipping'::text])),
  distance_value numeric,
  co2_kg numeric NOT NULL,
  activity_date timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT carbon_activities_pkey PRIMARY KEY (id),
  CONSTRAINT carbon_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.global_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  co2_saved numeric DEFAULT 0.00,
  trees_planted integer DEFAULT 0,
  users_active integer DEFAULT 0,
  waste_reduced numeric DEFAULT 0.00,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT global_stats_pkey PRIMARY KEY (id)
);
CREATE TABLE public.recycling_centers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  phone text,
  website text,
  accepted_materials ARRAY DEFAULT '{}'::text[],
  operating_hours jsonb DEFAULT '{}'::jsonb,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recycling_centers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scanned_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_name text NOT NULL,
  brand text,
  barcode text,
  eco_score integer CHECK (eco_score >= 0 AND eco_score <= 100),
  co2_impact numeric,
  scan_date timestamp with time zone DEFAULT now(),
  product_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT scanned_products_pkey PRIMARY KEY (id),
  CONSTRAINT scanned_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  achievement_id uuid,
  unlocked_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);
CREATE TABLE public.user_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  eco_score integer DEFAULT 0 CHECK (eco_score >= 0 AND eco_score <= 100),
  co2_saved numeric DEFAULT 0.00,
  points_earned integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  weekly_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_scores_pkey PRIMARY KEY (id),
  CONSTRAINT user_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);