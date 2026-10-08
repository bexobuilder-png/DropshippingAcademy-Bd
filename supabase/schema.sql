-- ============================================================================
-- Dropshipping Academy — Complete Supabase Database Setup (Waitlist + Founders Admin)
-- Authorized Admins: bexobuilder@gmail.com, rohit007jsr@gmail.com
-- Paste and run this entire script in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- ============================================================================
-- TABLE 1: public.waitlist
-- ============================================================================
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  first_name text not null check (char_length(trim(first_name)) between 2 and 50),
  last_name text not null check (char_length(trim(last_name)) between 2 and 50),
  date_of_birth date not null check (date_of_birth <= (current_date - interval '18 years')),
  phone text not null,
  whatsapp text not null,
  email text unique not null,
  consent_accepted boolean not null default false check (consent_accepted = true),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'contacted')),
  created_at timestamptz not null default now()
);

-- Note: If you have already created public.waitlist table previously, run this one-line migration in Supabase SQL Editor:
-- alter table public.waitlist drop constraint if exists waitlist_status_check;
-- alter table public.waitlist add constraint waitlist_status_check check (status in ('pending', 'approved', 'rejected', 'contacted'));

create index if not exists idx_waitlist_user_id on public.waitlist(user_id);
create index if not exists idx_waitlist_email on public.waitlist(email);
create index if not exists idx_waitlist_created_at on public.waitlist(created_at desc);

alter table public.waitlist enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.waitlist to authenticated;

-- Policy 1: Any authenticated user can INSERT their own waitlist entry
drop policy if exists "Users can insert their own waitlist entry" on public.waitlist;
create policy "Users can insert their own waitlist entry"
  on public.waitlist
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policy 2: Users can SELECT their own row OR authorized admins can SELECT all rows
drop policy if exists "Users can select their own waitlist entry" on public.waitlist;
drop policy if exists "Authenticated users can select waitlist entries" on public.waitlist;
drop policy if exists "Users or admins can select waitlist entries" on public.waitlist;
create policy "Users or admins can select waitlist entries"
  on public.waitlist
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com')
  );

-- Policy 3: Only authorized admins can UPDATE waitlist entries
drop policy if exists "Authenticated users can update waitlist entries" on public.waitlist;
drop policy if exists "Admins can update waitlist entries" on public.waitlist;
create policy "Admins can update waitlist entries"
  on public.waitlist
  for update
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com')
  )
  with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com')
  );

-- Policy 4: Only authorized admins can DELETE waitlist entries
drop policy if exists "Authenticated users can delete waitlist entries" on public.waitlist;
drop policy if exists "Admins can delete waitlist entries" on public.waitlist;
create policy "Admins can delete waitlist entries"
  on public.waitlist
  for delete
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com')
  );

-- ============================================================================
-- TABLE 2: public.founders (Managed from /check Admin Control Center)
-- ============================================================================
create table if not exists public.founders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  specialty text not null default 'E-Commerce Operations',
  short_bio text not null default '',
  photo_url text not null,
  alt text not null default 'Founder portrait',
  rotation_class text not null default '-rotate-3 md:-rotate-4',
  backdrop_color text not null default '#ff7722',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.founders enable row level security;

grant select on table public.founders to anon, authenticated;
grant insert, update, delete on table public.founders to authenticated;

-- Public visitors can view founders on the website
drop policy if exists "Public can view founders" on public.founders;
create policy "Public can view founders"
  on public.founders
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authorized admins can manage founders" on public.founders;
create policy "Authorized admins can manage founders"
  on public.founders for all to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com'))
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com'));

-- ============================================================================
-- TABLE 3: public.site_content (Managed from /check Admin Control Center)
-- Stores editable content for Bento Results, Curriculum, Testimonials, FAQs, Tools
-- ============================================================================
create table if not exists public.site_content (
  section_key text primary key,
  content_json jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

grant select on table public.site_content to anon, authenticated;
grant insert, update, delete on table public.site_content to authenticated;

drop policy if exists "Public can view site content" on public.site_content;
create policy "Public can view site content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authorized admins can manage site content" on public.site_content;
create policy "Authorized admins can manage site content"
  on public.site_content
  for all
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com')
  )
  with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com')
  );

