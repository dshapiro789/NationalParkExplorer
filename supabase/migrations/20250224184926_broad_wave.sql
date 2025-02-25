/*
  # Authentication and Profile Setup

  1. Tables
    - `profiles` table for user profile data
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `favorite_parks` (jsonb)
      - `preferences` (jsonb)

  2. Security
    - Enable RLS on profiles table
    - Add policies for:
      - Profile creation during signup
      - Profile viewing for authenticated users
      - Profile updates for own profile
*/

-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  favorite_parks jsonb default '[]'::jsonb,
  preferences jsonb default '{}'::jsonb,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Profiles are viewable by owner" on public.profiles;
drop policy if exists "Profiles are updatable by owner" on public.profiles;
drop policy if exists "Profiles can be created by new users" on public.profiles;

-- Create new policies
create policy "Profiles can be created by new users"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    lower(new.raw_user_meta_data->>'username'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to handle username updates
create or replace function public.check_username_unique()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from public.profiles
    where lower(username) = lower(new.username)
    and id != new.id
  ) then
    raise exception 'Username already taken';
  end if;
  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists username_unique on public.profiles;

-- Create trigger for username uniqueness
create trigger username_unique
  before insert or update on public.profiles
  for each row execute function public.check_username_unique();