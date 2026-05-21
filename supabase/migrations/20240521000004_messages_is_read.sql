-- ============================================
-- NestScout: Add read status and update policy to messages table
-- ============================================

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

-- Drop policy if it exists to make it idempotent
DROP POLICY IF EXISTS "Conversation participants can update messages" ON public.messages;

-- Create policy to allow conversation participants to update messages (read receipt)
CREATE POLICY "Conversation participants can update messages"
  ON public.messages FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.tenant_id = auth.uid() OR c.landlord_id = auth.uid())
    )
  );

