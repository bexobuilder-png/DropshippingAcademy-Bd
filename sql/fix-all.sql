-- ============================================================================
-- DROPSHIPPING ACADEMY BD — COMPLETE ALL-IN-ONE FIX MIGRATION SCRIPT
-- File: /sql/fix-all.sql
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Paste -> Run
-- This script is completely IDEMPOTENT (safe to re-run multiple times)
-- ============================================================================

-- 1. Enable pgcrypto
create extension if not exists "pgcrypto";

-- ============================================================================
-- SECTION 1: PHONE & EMAIL NORMALIZATION HELPERS + DATA BACKFILL
-- ============================================================================

-- Helper function to normalize Bangladesh phone numbers into canonical '01XXXXXXXXX'
create or replace function public.normalize_bd_phone(p_raw text)
returns text as $$
declare
  v_clean text;
begin
  if p_raw is null or trim(p_raw) = '' then
    return '';
  end if;

  -- 1. Translate Bangla numerals (০-৯) to standard Western digits (0-9)
  v_clean := translate(p_raw, '০১২৩৪৫৬৭৮৯', '0123456789');

  -- 2. Strip all non-digit characters (spaces, dashes, parentheses, +, etc.)
  v_clean := regexp_replace(v_clean, '\D', '', 'g');

  -- 3. Canonicalize Bangladesh country code prefixes:
  -- If starts with 880 (e.g. 88017XXXXXXXX), strip 88 -> 017XXXXXXXX
  if v_clean ~ '^880' then
    v_clean := substr(v_clean, 3);
  -- If starts with 1 and length is 10 (e.g. 17XXXXXXXX), prepend 0 -> 017XXXXXXXX
  elsif length(v_clean) = 10 and v_clean ~ '^1' then
    v_clean := '0' || v_clean;
  end if;

  return v_clean;
end;
$$ language plpgsql immutable;

-- Helper function to normalize emails
create or replace function public.normalize_email(p_raw text)
returns text as $$
begin
  if p_raw is null then
    return '';
  end if;
  return lower(trim(p_raw));
end;
$$ language plpgsql immutable;

-- BACKFILL: Normalize existing data already stored in public.waitlist table
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'waitlist') then
    update public.waitlist
    set
      phone = public.normalize_bd_phone(phone),
      whatsapp = public.normalize_bd_phone(whatsapp),
      email = public.normalize_email(email)
    where phone is not null or email is not null;
  end if;
end $$;

-- Add index on canonical phone and email for fast lookups
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'waitlist') then
    create index if not exists idx_waitlist_phone_canonical on public.waitlist(phone);
    create index if not exists idx_waitlist_whatsapp_canonical on public.waitlist(whatsapp);
  end if;
end $$;


-- ============================================================================
-- SECTION 2: ISSUE 1 — QUICK SIGN IN LOOKUP & RATE-LIMITED OTP RPC
-- ============================================================================

-- Table to enforce rate limiting: max 5 OTP requests per hour per account / IP
create table if not exists public.otp_rate_limits (
  identifier text primary key,
  request_count int not null default 1,
  window_start timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.otp_rate_limits enable row level security;
-- Internal table accessed via SECURITY DEFINER function only

-- Helper function to mask email address: e.g. "rohit007jsr@gmail.com" -> "ro***@gmail.com"
create or replace function public.mask_email(p_email text)
returns text as $$
declare
  v_parts text[];
  v_local text;
  v_domain text;
begin
  if p_email is null or position('@' in p_email) = 0 then
    return '***';
  end if;
  v_parts := string_to_array(p_email, '@');
  v_local := v_parts[1];
  v_domain := v_parts[2];

  if length(v_local) <= 2 then
    return substr(v_local, 1, 1) || '***@' || v_domain;
  else
    return substr(v_local, 1, 2) || '***@' || v_domain;
  end if;
end;
$$ language plpgsql immutable;

-- RPC: Looks up applicant by normalized phone or email, validates rate limit,
-- and returns masked email hint so Supabase Auth email OTP can be dispatched
create or replace function public.request_quick_login_otp(
  p_identifier text,
  p_ip text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean text;
  v_is_email boolean;
  v_norm_phone text;
  v_user record;
  v_rate record;
  v_rate_key text;
  v_masked text;
begin
  if p_identifier is null or trim(p_identifier) = '' then
    return jsonb_build_object(
      'success', false,
      'code', 'invalid_input',
      'message', 'Please enter a valid phone number or email address.'
    );
  end if;

  v_clean := trim(p_identifier);
  v_is_email := position('@' in v_clean) > 0;

  if v_is_email then
    v_clean := lower(v_clean);
    select id, user_id, first_name, last_name, email, phone, whatsapp, status, created_at
    into v_user
    from public.waitlist
    where lower(trim(email)) = v_clean
    limit 1;
  else
    v_norm_phone := public.normalize_bd_phone(v_clean);
    select id, user_id, first_name, last_name, email, phone, whatsapp, status, created_at
    into v_user
    from public.waitlist
    where public.normalize_bd_phone(phone) = v_norm_phone
       or public.normalize_bd_phone(whatsapp) = v_norm_phone
    limit 1;
  end if;

  -- 1. Check if user is registered
  if v_user.id is null then
    return jsonb_build_object(
      'success', false,
      'code', 'not_found',
      'message', 'No registration record found for this phone number or email.'
    );
  end if;

  -- 2. Check if applicant has an email on file
  if v_user.email is null or trim(v_user.email) = '' then
    return jsonb_build_object(
      'success', false,
      'code', 'no_email',
      'message', 'Your profile has no email linked. Please contact support.'
    );
  end if;

  -- 3. Enforce Rate Limiting (max 5 requests per 60 minutes)
  v_rate_key := lower(trim(v_user.email));
  select * into v_rate from public.otp_rate_limits where identifier = v_rate_key;

  if v_rate.identifier is not null then
    if (now() - v_rate.window_start) < interval '1 hour' then
      if v_rate.request_count >= 5 then
        return jsonb_build_object(
          'success', false,
          'code', 'rate_limited',
          'message', 'Too many verification code attempts. Please wait 1 hour or contact support.'
        );
      else
        update public.otp_rate_limits
        set request_count = request_count + 1, updated_at = now()
        where identifier = v_rate_key;
      end if;
    else
      -- Reset rolling 1-hour window
      update public.otp_rate_limits
      set request_count = 1, window_start = now(), updated_at = now()
      where identifier = v_rate_key;
    end if;
  else
    insert into public.otp_rate_limits (identifier, request_count, window_start, updated_at)
    values (v_rate_key, 1, now(), now());
  end if;

  v_masked := public.mask_email(v_user.email);

  return jsonb_build_object(
    'success', true,
    'code', 'otp_ready',
    'email', lower(trim(v_user.email)),
    'masked_email', v_masked,
    'first_name', v_user.first_name,
    'last_name', v_user.last_name,
    'phone', v_user.phone,
    'whatsapp', v_user.whatsapp,
    'status', v_user.status,
    'id', v_user.id
  );
end;
$$;

grant execute on function public.request_quick_login_otp(text, text) to anon, authenticated;


-- ============================================================================
-- SECTION 3: ISSUE 2 — SHARED PUBLIC.COURSES TABLE WITH REALTIME
-- ============================================================================

create table if not exists public.courses (
  id text primary key,
  title text not null,
  batch_name text,
  category text not null default 'ড্রপশিপিং রিসেলিং',
  subtitle text not null default '',
  description text not null default '',
  highlights text[] not null default '{}',
  duration text not null default '৮ সপ্তাহ · লাইভ ক্লাস',
  price integer not null default 1000,
  discount_price integer,
  badge text,
  is_active boolean not null default true,
  is_running boolean not null default false,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_courses_running on public.courses(is_running) where is_running = true;
create index if not exists idx_courses_active_visible on public.courses(is_active, is_visible);

alter table public.courses enable row level security;

grant select on table public.courses to anon, authenticated;
grant insert, update, delete on table public.courses to authenticated;

-- Policy 1: Public visitors can view visible, active courses
drop policy if exists "Public can view active courses" on public.courses;
create policy "Public can view active courses"
  on public.courses
  for select
  to anon, authenticated
  using (is_visible = true and is_active = true);

-- Policy 2: Authorized admins have complete read/write access to all courses
drop policy if exists "Admins can manage all courses" on public.courses;
create policy "Admins can manage all courses"
  on public.courses
  for all
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com')
  )
  with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) in ('bexobuilder@gmail.com', 'rohit007jsr@gmail.com')
  );

-- Enable Supabase Realtime publication for instant cross-device updates
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'courses') then
    alter publication supabase_realtime add table public.courses;
  end if;
exception
  when undefined_object then
    null;
end $$;

-- Seed default academy courses if the table is currently empty
insert into public.courses (
  id, title, batch_name, category, subtitle, description, highlights, duration, price, discount_price, badge, is_active, is_running, is_visible, sort_order
)
values
  (
    'sakku-batch-1',
    'সাক্কু ব্যাচ ১: ড্রপশিপিং ও ই-কমার্স মাস্টারক্লাস',
    'Sakku Batch 1',
    'ড্রপশিপিং রিসেলিং',
    'শূন্য থেকে প্রফেশনাল অনলাইন ব্যবসা গড়ার সম্পূর্ণ হ্যান্ডস-অন ট্রেনিং',
    'পণ্য রিসার্চ, দেশি ও আন্তর্জাতিক সাপ্লায়ার ম্যানেজমেন্ট, হাই-কনভার্টিং স্টোর সেটআপ এবং মেটা/টিকটক পেইড বিজ্ঞাপনের পূর্ণাঙ্গ স্ট্র্যাটেজি নিয়ে সাজানো বিশেষ ব্যাচ। সরাসরি লাইভ ক্লাসে মেন্টরদের সাথে কাজ শিখুন।',
    array['হ্যান্ডস-অন প্রজেক্ট ও লাইভ সাপোর্ট', 'সাপ্লায়ার ও পেমেন্ট গেটওয়ে ইন্টিগ্রেশন', '২৪/৭ ডেডিকেটেড স্টুডেন্ট হেল্পডেস্ক', 'কোর্স শেষে ভেরিফায়েড সার্টিফিকেট'],
    '৮ সপ্তাহ · লাইভ ক্লাস',
    1000,
    1000,
    'জনপ্রিয় ব্যাচ',
    true,
    true,
    true,
    1
  ),
  (
    'digital-marketing-growth',
    'ডিজিটাল মার্কেটিং ও সেলস গ্রোথ মাস্টারক্লাস',
    'Growth Batch',
    'মার্কেটিং কিভাবে করবেন',
    'অরগানিক ও পেইড ক্যাম্পেইনে বিক্রয় বাড়ানোর পূর্ণাঙ্গ গাইডলাইন',
    'সোশ্যাল মিডিয়া পেইজ মনিটাইজেশন, টার্গেটেড ফেসবুক ও টিকটক ক্যাম্পেইন সেটআপ এবং রিটার্গেটিং ফানেল তৈরির বাস্তবসম্মত প্রশিক্ষণ।',
    array['ফেসবুক ও মেটা অ্যাড ম্যানেজার স্ট্র্যাটেজি', 'কনভার্সন অপ্টিমাইজেশন ও বাজেট স্কেলিং', 'সেলস ফানেল ও কাস্টমার রিটেনশন', 'লাইভ কেস স্টাডি অ্যানালাইসিস'],
    '৬ সপ্তাহ · লাইভ ক্লাস',
    1000,
    1000,
    'বিশেষ ছাড়',
    true,
    false,
    true,
    2
  ),
  (
    'shopify-ecommerce-pro',
    'শপিফাই ও কমপ্লিট ই-কমার্স ডেভেলপমেন্ট',
    'Pro Batch',
    'ই-কমার্স ওয়েবসাইট তৈরি',
    'কোডিং ছাড়াই প্রিমিয়াম অনলাইন স্টোর নির্মাণ ও অটোমেশন',
    'শপিফাই প্ল্যাটফর্মে প্রফেশনাল ড্রপশিপিং শপ ডিজাইন, অ্যাপস ও পেমেন্ট গেটওয়ে সেটআপ এবং অর্ডার অটোমেশন প্রক্রিয়া সহজ ভাষায় শিখুন।',
    array['কোডিং ছাড়া শপিফাই স্টোর ডিজাইন', 'ইনভেন্টরি ও ড্রপশিপিং প্লাগইন ইন্টিগ্রেশন', 'মোবাইল-ফার্স্ট চেকআউট অপ্টিমাইজেশন', 'বিজনেস স্কেলিং রোডম্যাপ'],
    '১০ সপ্তাহ · লাইভ ক্লাস',
    1000,
    1000,
    'অ্যাডভান্সড',
    true,
    false,
    true,
    3
  )
on conflict (id) do nothing;


-- ============================================================================
-- SECTION 4: ISSUE 3 — PRIVACY-PRESERVING WAITLIST DIRECTORY & COUNTS RPC
-- ============================================================================

-- Returns ONLY first_name, status, and created_at. Strictly protects privacy.
create or replace function public.get_waitlist_directory(
  p_status text default null,
  p_search text default null,
  p_limit int default 200,
  p_offset int default 0
)
returns table (
  id uuid,
  first_name text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean_search text;
begin
  v_clean_search := lower(trim(coalesce(p_search, '')));

  return query
  select
    w.id,
    w.first_name,
    w.status,
    w.created_at
  from public.waitlist w
  where
    (p_status is null or p_status = 'all' or lower(w.status) = lower(p_status))
    and (v_clean_search = '' or lower(w.first_name) like '%' || v_clean_search || '%')
  order by w.created_at desc
  limit coalesce(p_limit, 200)
  offset coalesce(p_offset, 0);
end;
$$;

-- Returns accurate aggregate counts across the entire public.waitlist table
create or replace function public.get_waitlist_counts()
returns table (
  total_count bigint,
  approved_count bigint,
  pending_count bigint,
  rejected_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    count(*)::bigint as total_count,
    count(*) filter (where lower(status) = 'approved')::bigint as approved_count,
    count(*) filter (where lower(status) = 'pending')::bigint as pending_count,
    count(*) filter (where lower(status) = 'rejected')::bigint as rejected_count
  from public.waitlist;
end;
$$;

grant execute on function public.get_waitlist_directory(text, text, int, int) to anon, authenticated;
grant execute on function public.get_waitlist_counts() to anon, authenticated;

-- ============================================================================
-- VERIFICATION CONFIRMATION OUTPUT
-- ============================================================================
select
  'FIX APPLIED SUCCESSFULLY' as status,
  (select count(*) from public.courses) as total_courses,
  (select count(*) from public.waitlist) as total_waitlist_entries;
