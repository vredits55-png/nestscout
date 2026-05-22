-- Add linked_providers text array column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linked_providers text[] NOT NULL DEFAULT '{}';
