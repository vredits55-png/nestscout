-- ============================================
-- NestScout: Notifications Table & Realtime Setup
-- ============================================

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('enquiry', 'booking_request', 'deletion_request')),
  title text not null,
  message text not null,
  link text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Policies
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own notifications" on public.notifications;
create policy "Users can delete their own notifications"
  on public.notifications for delete using (auth.uid() = user_id);

drop policy if exists "Authenticated users can insert notifications" on public.notifications;
create policy "Authenticated users can insert notifications"
  on public.notifications for insert with check (auth.role() = 'authenticated');

-- Indexes for performance
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
