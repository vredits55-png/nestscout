-- ============================================
-- NestScout: Mutual Conversation Deletion
-- Run this in Supabase SQL Editor
-- ============================================

-- Alter the conversations table to track deletion state
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS deletion_requested_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS deletion_status text CHECK (deletion_status IN ('none', 'requested', 'deleted')) DEFAULT 'none';

-- Add RLS policy to allow users to update the deletion state of their conversations
DROP POLICY IF EXISTS "Users can update deletion status of their conversations" ON public.conversations;
CREATE POLICY "Users can update deletion status of their conversations"
  ON public.conversations FOR UPDATE USING (
    auth.uid() = tenant_id OR auth.uid() = landlord_id
  );
