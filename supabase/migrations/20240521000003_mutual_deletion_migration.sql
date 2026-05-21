-- ============================================
-- NestScout: Mutual Conversation Deletion
-- Run this in Supabase SQL Editor
-- ============================================

-- Alter the conversations table to track deletion state
ALTER TABLE public.conversations 
ADD COLUMN deletion_requested_by uuid REFERENCES auth.users(id),
ADD COLUMN deletion_status text CHECK (deletion_status IN ('none', 'requested', 'deleted')) DEFAULT 'none';

-- Add RLS policy to allow users to update the deletion state of their conversations
CREATE POLICY "Users can update deletion status of their conversations"
  ON public.conversations FOR UPDATE USING (
    auth.uid() = tenant_id OR auth.uid() = landlord_id
  );

-- Update the existing SELECT policy to hide "deleted" conversations
-- (Drop the old one first if necessary, or just create a new view/condition)
-- For simplicity, we'll just filter them out in the Next.js fetch queries.
