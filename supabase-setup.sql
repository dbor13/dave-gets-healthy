-- Run this entire script in your Supabase SQL Editor
-- Dashboard > SQL Editor > New query > paste > Run

-- Food entries table
CREATE TABLE food_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner', 'dessert')),
  name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein DECIMAL(5,1) NOT NULL DEFAULT 0,
  carbs DECIMAL(5,1) NOT NULL DEFAULT 0,
  fat DECIMAL(5,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout entries table
CREATE TABLE workout_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weigh-ins table
CREATE TABLE weigh_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  weight_lbs DECIMAL(5,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weigh_ins ENABLE ROW LEVEL SECURITY;

-- Allow full public access (no login required)
CREATE POLICY "public_all" ON food_entries FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON workout_entries FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON weigh_ins FOR ALL TO anon USING (true) WITH CHECK (true);

-- Indexes for fast date lookups
CREATE INDEX idx_food_entries_date ON food_entries(date);
CREATE INDEX idx_workout_entries_date ON workout_entries(date);
CREATE INDEX idx_weigh_ins_date ON weigh_ins(date);
