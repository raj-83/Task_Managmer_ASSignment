/*
  # Create tasks table and policies

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, required)
      - `description` (text)
      - `is_completed` (boolean, default false)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on tasks table
    - Add policies for CRUD operations if they don't exist
*/

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' 
    AND policyname = 'Users can create own tasks'
  ) THEN
    CREATE POLICY "Users can create own tasks"
      ON tasks
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' 
    AND policyname = 'Users can read own tasks'
  ) THEN
    CREATE POLICY "Users can read own tasks"
      ON tasks
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' 
    AND policyname = 'Users can update own tasks'
  ) THEN
    CREATE POLICY "Users can update own tasks"
      ON tasks
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' 
    AND policyname = 'Users can delete own tasks'
  ) THEN
    CREATE POLICY "Users can delete own tasks"
      ON tasks
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;