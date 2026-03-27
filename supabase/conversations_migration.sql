-- ============================================
-- NestScout: Conversations & Booking Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Conversations Table
-- ============================================
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'booking_requested', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(property_id, tenant_id)
);

alter table public.conversations enable row level security;

create policy "Tenants can view their conversations"
  on public.conversations for select using (auth.uid() = tenant_id);

create policy "Landlords can view their conversations"
  on public.conversations for select using (auth.uid() = landlord_id);

create policy "Tenants can create conversations"
  on public.conversations for insert with check (auth.uid() = tenant_id);

create policy "Participants can update conversations"
  on public.conversations for update using (auth.uid() = tenant_id or auth.uid() = landlord_id);

-- ============================================
-- 2. Messages Table
-- ============================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  message_type text not null default 'text' check (message_type in ('text', 'booking_request', 'booking_confirmed', 'booking_rejected', 'system')),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Conversation participants can view messages"
  on public.messages for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

create policy "Conversation participants can send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

-- ============================================
-- 3. Booking Requests Table
-- ============================================
create table public.booking_requests (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  check_in date not null,
  check_out date not null,
  total_nights int not null default 1,
  proposed_price numeric not null default 0,
  note text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.booking_requests enable row level security;

create policy "Tenants can view their booking requests"
  on public.booking_requests for select using (auth.uid() = tenant_id);

create policy "Landlords can view booking requests for their conversations"
  on public.booking_requests for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.landlord_id = auth.uid()
    )
  );

create policy "Tenants can create booking requests"
  on public.booking_requests for insert with check (auth.uid() = tenant_id);

create policy "Landlords can update booking requests"
  on public.booking_requests for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.landlord_id = auth.uid()
    )
  );

create policy "Tenants can update their own booking requests"
  on public.booking_requests for update using (auth.uid() = tenant_id);

-- ============================================
-- 4. Indexes
-- ============================================
create index idx_conversations_tenant on public.conversations(tenant_id);
create index idx_conversations_landlord on public.conversations(landlord_id);
create index idx_conversations_property on public.conversations(property_id);
create index idx_messages_conversation on public.messages(conversation_id);
create index idx_messages_created on public.messages(created_at);
create index idx_booking_requests_conversation on public.booking_requests(conversation_id);
