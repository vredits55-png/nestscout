-- ============================================
-- Enable delete policies for booking requests for both participants
-- ============================================

drop policy if exists "Tenants can delete booking requests" on public.booking_requests;
drop policy if exists "Conversation participants can delete booking requests" on public.booking_requests;

create policy "Conversation participants can delete booking requests"
  on public.booking_requests for delete using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );
