-- Fix user_preferences table to allow multiple rows per user
-- First, let's check the current structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
ORDER BY ordinal_position;

-- Check current constraints
SELECT 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_preferences';

-- Drop the existing table and recreate it with the correct structure
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Recreate user_preferences table with composite primary key
CREATE TABLE user_preferences (
  user_email TEXT NOT NULL REFERENCES users(email),
  preferred_persona TEXT NOT NULL,
  preferred_purpose TEXT NOT NULL,
  total_conversations INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_email, preferred_persona, preferred_purpose)
);

-- Add indexes for better performance
CREATE INDEX idx_user_preferences_user_email ON user_preferences(user_email);
CREATE INDEX idx_user_preferences_persona_purpose ON user_preferences(preferred_persona, preferred_purpose);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

-- Create new policies for the updated table
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

-- Verify the changes
SELECT 
  table_name, 
  column_name, 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'user_preferences'
ORDER BY constraint_type; 