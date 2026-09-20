-- GoTogether MVP schema — run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  hobbies text[] not null default '{}',
  ui_language text default 'en',
  spoken_languages text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe migration for existing projects
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists hobbies text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles (id) on delete set null,
  title text not null,
  category text not null check (
    category in ('coffee', 'games', 'language', 'walks', 'yoga')
  ),
  latitude double precision not null,
  longitude double precision not null,
  time_text text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.events add column if not exists is_active boolean not null default true;

create index if not exists events_active_idx on public.events (is_active);
create index if not exists events_category_idx on public.events (category);

-- ---------------------------------------------------------------------------
-- auto-create profile on sign-up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, ui_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'ui_language', 'en')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Active events are viewable by everyone" on public.events;
create policy "Active events are viewable by everyone"
  on public.events for select
  using (is_active = true);

drop policy if exists "Authenticated users can create events" on public.events;
create policy "Authenticated users can create events"
  on public.events for insert
  with check (auth.uid() = creator_id);

-- ---------------------------------------------------------------------------
-- messages (direct 1:1 chat)
-- Enable Realtime in Supabase Dashboard: Database → Replication → messages
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  text text not null check (char_length(trim(text)) > 0 and char_length(text) <= 2000),
  constraint messages_no_self check (sender_id <> receiver_id)
);

create index if not exists messages_sender_created_idx
  on public.messages (sender_id, created_at desc);

create index if not exists messages_receiver_created_idx
  on public.messages (receiver_id, created_at desc);

create index if not exists messages_participants_created_idx
  on public.messages (sender_id, receiver_id, created_at desc);

alter table public.messages enable row level security;

drop policy if exists "Users read own messages" on public.messages;
create policy "Users read own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users send messages as themselves" on public.messages;
create policy "Users send messages as themselves"
  on public.messages for insert
  with check (auth.uid() = sender_id and sender_id <> receiver_id);

-- ---------------------------------------------------------------------------
-- avatars storage (profile photos)
-- Create bucket in Dashboard if this fails: Storage → New bucket → "avatars" (public)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- seed Berlin MVP markers (safe to re-run)
-- ---------------------------------------------------------------------------
insert into public.events (id, title, category, latitude, longitude, time_text, is_active)
values
  (
    'a1000001-0001-4001-8001-000000000001',
    'Morning Coffee',
    'coffee',
    52.538,
    13.424,
    'Prenzlauer Berg • morning',
    true
  ),
  (
    'a1000001-0001-4001-8001-000000000002',
    'Board Game Night',
    'games',
    52.498,
    13.404,
    'Kreuzberg • tonight',
    true
  ),
  (
    'a1000001-0001-4001-8001-000000000003',
    'German Conversation Walk',
    'language',
    52.512,
    13.388,
    'Prenzlauer Berg • in 20 min',
    true
  ),
  (
    'a1000001-0001-4001-8001-000000000004',
    'Sunset Canal Walk',
    'walks',
    52.478,
    13.442,
    'Neukölln • sunset',
    true
  ),
  (
    'a1000001-0001-4001-8001-000000000005',
    'Park Yoga Session',
    'yoga',
    52.532,
    13.41,
    'Prenzlauer Berg • 18:00',
    true
  )
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  time_text = excluded.time_text,
  is_active = excluded.is_active;
