-- ============================================
-- Enable REPLICA IDENTITY FULL for realtime delete events
-- ============================================

ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.booking_requests REPLICA IDENTITY FULL;
