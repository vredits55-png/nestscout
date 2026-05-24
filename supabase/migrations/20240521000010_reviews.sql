-- ============================================
-- Client Reviews & Ratings Table
-- ============================================

create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique(property_id, user_id)
);

alter table public.reviews enable row level security;

-- Select policy: viewable by everyone
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

-- Insert policy: authenticated users can write reviews
drop policy if exists "Authenticated users can submit reviews" on public.reviews;
create policy "Authenticated users can submit reviews"
  on public.reviews for insert with check (auth.uid() = user_id);

-- Update policy: authenticated users can edit their reviews
drop policy if exists "Users can update their own reviews" on public.reviews;
create policy "Users can update their own reviews"
  on public.reviews for update using (auth.uid() = user_id);

-- Delete policy: authenticated users can remove their reviews
drop policy if exists "Users can delete their own reviews" on public.reviews;
create policy "Users can delete their own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

-- Performance index
create index if not exists idx_reviews_property on public.reviews(property_id);
