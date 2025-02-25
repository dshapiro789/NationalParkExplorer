/*
  # Trip Planning Schema

  1. New Tables
    - `trips`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `trip_items`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, references trips)
      - `park_id` (text)
      - `date` (date)
      - `notes` (text)
      - `order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `trip_checklists`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, references trips)
      - `title` (text)
      - `items` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own trips
*/

-- Create trips table
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint valid_dates check (end_date >= start_date)
);

-- Create trip items table
create table if not exists public.trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  park_id text not null,
  date date not null,
  notes text,
  "order" integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create trip checklists table
create table if not exists public.trip_checklists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  title text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.trips enable row level security;
alter table public.trip_items enable row level security;
alter table public.trip_checklists enable row level security;

-- Policies for trips
create policy "Users can create their own trips"
  on public.trips for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own trips"
  on public.trips for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own trips"
  on public.trips for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own trips"
  on public.trips for delete
  to authenticated
  using (auth.uid() = user_id);

-- Policies for trip items
create policy "Users can manage their trip items"
  on public.trip_items for all
  to authenticated
  using (
    exists (
      select 1 from public.trips
      where trips.id = trip_items.trip_id
      and trips.user_id = auth.uid()
    )
  );

-- Policies for trip checklists
create policy "Users can manage their trip checklists"
  on public.trip_checklists for all
  to authenticated
  using (
    exists (
      select 1 from public.trips
      where trips.id = trip_checklists.trip_id
      and trips.user_id = auth.uid()
    )
  );

-- Function to update timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add triggers for updated_at
create trigger set_trips_updated_at
  before update on public.trips
  for each row execute function public.handle_updated_at();

create trigger set_trip_items_updated_at
  before update on public.trip_items
  for each row execute function public.handle_updated_at();

create trigger set_trip_checklists_updated_at
  before update on public.trip_checklists
  for each row execute function public.handle_updated_at();