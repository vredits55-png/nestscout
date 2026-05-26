-- ============================================
-- Enable delete policies for messages and booking requests
-- ============================================

drop policy if exists "Conversation participants can delete messages" on public.messages;
create policy "Conversation participants can delete messages"
  on public.messages for delete using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

drop policy if exists "Tenants can delete booking requests" on public.booking_requests;
create policy "Tenants can delete booking requests"
  on public.booking_requests for delete using (
    auth.uid() = tenant_id
  );

drop policy if exists "Participants can delete their conversations" on public.conversations;
create policy "Participants can delete their conversations"
  on public.conversations for delete using (
    auth.uid() = tenant_id or auth.uid() = landlord_id
  );

