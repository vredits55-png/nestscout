-- ============================================
-- NestScout Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. Profiles Table (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  role text not null default 'client' check (role in ('provider', 'client')),
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ============================================
-- 2. Properties Table
-- ============================================
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  property_type text not null default 'apartment' check (property_type in ('apartment', 'house', 'studio', 'villa', 'condo')),
  price_per_month numeric not null default 0,
  bedrooms int not null default 1,
  bathrooms int not null default 1,
  area_sqft int not null default 0,
  address text not null default '',
  city text not null default '',
  state text not null default '',
  zip_code text not null default '',
  latitude double precision not null default 0,
  longitude double precision not null default 0,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  is_available boolean not null default true,
  neighborhood_info text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

create policy "Properties are viewable by everyone"
  on public.properties for select using (true);

create policy "Providers can insert properties"
  on public.properties for insert with check (auth.uid() = provider_id);

create policy "Providers can update their own properties"
  on public.properties for update using (auth.uid() = provider_id);

create policy "Providers can delete their own properties"
  on public.properties for delete using (auth.uid() = provider_id);

-- ============================================
-- 3. Favorites Table
-- ============================================
create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, property_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select using (auth.uid() = user_id);

create policy "Users can add favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

create policy "Users can remove their favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- ============================================
-- 4. Inquiries Table
-- ============================================
create table public.inquiries (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

create policy "Senders can view their sent inquiries"
  on public.inquiries for select using (auth.uid() = sender_id);

create policy "Receivers can view their received inquiries"
  on public.inquiries for select using (auth.uid() = receiver_id);

create policy "Authenticated users can send inquiries"
  on public.inquiries for insert with check (auth.uid() = sender_id);

create policy "Receivers can update inquiry read status"
  on public.inquiries for update using (auth.uid() = receiver_id);

-- ============================================
-- 5. Storage Bucket for property images
-- ============================================
insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true);

create policy "Anyone can view property images"
  on storage.objects for select using (bucket_id = 'property-images');

create policy "Authenticated users can upload property images"
  on storage.objects for insert with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

create policy "Users can delete their own images"
  on storage.objects for delete using (bucket_id = 'property-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 6. Function: Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 7. Indexes for performance
-- ============================================
create index idx_properties_provider on public.properties(provider_id);
create index idx_properties_city on public.properties(city);
create index idx_properties_price on public.properties(price_per_month);
create index idx_properties_available on public.properties(is_available);
create index idx_properties_location on public.properties(latitude, longitude);
create index idx_favorites_user on public.favorites(user_id);
create index idx_inquiries_receiver on public.inquiries(receiver_id);
create index idx_inquiries_sender on public.inquiries(sender_id);
