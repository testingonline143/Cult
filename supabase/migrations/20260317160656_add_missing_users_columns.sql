/*
  # Add missing columns to users table

  1. Modified Tables
    - `users`
      - Add `role` (text, default 'user', not null) - user role for authorization
      - Add `interests` (text array, nullable) - user interest tags
      - Add `updated_at` (timestamp, default now()) - last profile update time

  2. Notes
    - These columns are required by the Drizzle ORM schema in shared/models/auth.ts
    - Without them, all user-related queries fail at runtime
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role text NOT NULL DEFAULT 'user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'interests'
  ) THEN
    ALTER TABLE public.users ADD COLUMN interests text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;