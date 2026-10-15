# Fix-All Plan: Shared Supabase Data Layer, Quick Sign-In, Course Sync & Waitlist Directory

A targeted architectural upgrade resolving the four core data layer and UI issues in Dropshipping Academy BD. This replaces local/fragmented storage with a shared Supabase PostgreSQL schema, introduces a privacy-preserving public waitlist RPC, connects all course views to a live database table with real-time replication, fixes phone/email normalization for Quick Sign-In with masked email OTP delivery, cleans up duplicate landing page cards, and delivers a re-runnable `/sql/fix-all.sql` migration script.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during interactive clarification:
> - **Issue 4 (Landing Page Placement)**: The running course card will appear **only once on the landing page**, placed directly below the hero section (above the "3 steps to build your online business" heading). The duplicate instance inside the steps block will be removed.
> - **Issue 1 (OTP Delivery)**: The 6-digit Quick Sign In verification code will be dispatched via **Supabase Auth email OTP** (`signInWithOtp`) to the verified email address linked to the matching applicant profile.

---

### 1. Root-Cause Analysis & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Root Causes & Resolution                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
 ┌─────────────────────────────────┼─────────────────────────────────┐
 ▼                                 ▼                                 ▼
【Issue 1: Quick Sign-In】       【Issue 2: Course Sync】          【Issue 3: Waitlist Member Count】
 • Cause: Unauthenticated         • Cause: Admin edits stored in    • Cause: RLS policy on waitlist
   anonymous users cannot read      localStorage/site_content, not    table enforces `auth.uid() =
   waitlist table due to RLS;       a shared table with RLS.          user_id`, so non-admin users
   phone formats vary (+880,       • Fix: Dedicated `courses`        can only select their own row.
   01, Bangla digits).              table in Supabase with RLS,     • Fix: Privacy-safe PostgreSQL
 • Fix: Security Definer RPC        Realtime publication, and         `SECURITY DEFINER` RPC returning
   normalizing phone/email,         no-cache fetch listeners.         ONLY `first_name, status,
   masked email hint, and OTP                                         created_at` with aggregate counts.
   via Supabase Auth.
```

- **Issue 1 Root Cause**: `lookupRegisteredApplicant` in `src/services/auth.ts` calls `supabase.from('waitlist').select('*')` before the user is authenticated. Supabase Row-Level Security (RLS) Policy 2 requires `authenticated` and `auth.uid() = user_id`, causing anonymous queries to return empty sets. Furthermore, phone formats are not normalized across `+880`, `880`, `01...` and Bangla numerals (`০১২৩৪৫৬৭৮৯`).
- **Issue 2 Root Cause**: Courses have been written to `site_content` or `localStorage.getItem('da_courses_custom_v1')`. Without a dedicated `public.courses` table, changes made in one browser do not propagate to visitors on other devices.
- **Issue 3 Root Cause**: The waitlist page queries `public.waitlist` as an authenticated student. Because RLS restricts students to their own `user_id`, they only receive 1 record back.
- **Issue 4 Root Cause**: `RunningCourseCard` was rendered both in `HomePage.tsx` (below Hero) and inside `HomeSections.tsx` (inside the steps block).

---

### 2. Implementation Scope & Component Changes

#### Component & Data Flow Diagram

```
                                  ┌──────────────────────────────┐
                                  │      Client Applications     │
                                  │   (Mobile, Desktop, Admin)   │
                                  └──────────────┬───────────────┘
                                                 │
                   ┌─────────────────────────────┼────────────────────────────┐
                   ▼                             ▼                            ▼
         ┌───────────────────┐         ┌───────────────────┐        ┌───────────────────┐
         │ Quick Sign In     │         │ Running Course &  │        │ Registered        │
         │ Auth Modal        │         │ Courses Section   │        │ Waitlist Page     │
         └─────────┬─────────┘         └─────────┬─────────┘        └─────────┬─────────┘
                   │                             │                            │
                   ▼                             ▼                            ▼
         ┌───────────────────┐         ┌───────────────────┐        ┌───────────────────┐
         │ RPC: request_     │         │ Table:            │        │ RPC: get_waitlist_│
         │ quick_login_otp   │         │ public.courses    │        │ public_directory  │
         │ (SecurityDefiner) │         │ (RLS + Realtime)  │        │ (First name only) │
         └─────────┬─────────┘         └─────────┬─────────┘        └─────────┬─────────┘
                   │                             │                            │
                   └─────────────────────────────┼────────────────────────────┘
                                                 ▼
                                     ┌───────────────────────┐
                                     │  Supabase PostgreSQL  │
                                     │  Database & Auth      │
                                     └───────────────────────┘
```

#### Detailed Changes by Issue:

1. **Issue 1: Phone/Email Normalization & Quick Sign-In**:
   - Create client and database normalization functions converting Bangla digits to ASCII (`০-৯` -> `0-9`), stripping punctuation, and canonicalizing Bangladesh mobile numbers to standard 11-digit `01XXXXXXXXX` format.
   - Database RPC `public.request_quick_login_otp(p_identifier text, p_ip text default null)`:
     - Looks up applicant profile in `public.waitlist` by canonical phone or email.
     - Enforces rate limiting (max 5 requests per hour).
     - Returns `{ success: true, masked_email: "ro***@gmail.com", user_email: "..." }` or clean errors (`"no_email"`, `"not_found"`, `"rate_limited"`).
   - In `src/services/auth.ts`: Invoke the RPC, trigger `supabase.auth.signInWithOtp({ email })`, show the masked email hint in the UI, and verify the 6-digit code.
   - Maintain persistent session in `localStorage` across reloads and tab restarts until explicit Sign Out.

2. **Issue 2: Shared `public.courses` Table & Real-Time Sync**:
   - Create table `public.courses` with columns: `id`, `title`, `batch_name`, `category`, `subtitle`, `description`, `highlights`, `duration`, `price`, `discount_price`, `badge`, `is_active`, `is_running`, `is_visible`, `sort_order`, `updated_at`.
   - RLS Policies: Public `SELECT` allowed where `is_visible = true AND is_active = true`; admin full `ALL` access for `bexobuilder@gmail.com` and `rohit007jsr@gmail.com`.
   - Add `public.courses` to `supabase_realtime` publication.
   - Update `src/services/courses.ts`: Fetch from `public.courses` with `cache: 'no-store'`, subscribe to Supabase Realtime channel, and re-fetch on window focus (`visibilitychange`).
   - Seed table with current courses ("Sakku Batch 1", "Digital Marketing & Sales Growth", "Shopify & Complete E-Commerce").

3. **Issue 3: Privacy-Safe Waitlist Directory & Aggregate Counts**:
   - Create PostgreSQL `SECURITY DEFINER` function `public.get_waitlist_directory(p_status text, p_search text, p_limit int, p_offset int)` returning **only**:
     - `id`, `first_name`, `status`, `created_at` (strictly hides phone, email, and last name).
   - Create companion RPC `public.get_waitlist_counts()` returning true table totals: `total_count`, `approved_count`, `pending_count`, `rejected_count`.
   - Grant `EXECUTE` on both functions to `authenticated` users only.
   - Update `src/pages/WaitlistPage.tsx` to call these RPCs, calculate counts from the full table, and provide smooth pagination / search.

4. **Issue 4: UI Cleanup (Single Running Course Card)**:
   - Remove `<RunningCourseCard>` from `src/components/HomeSections.tsx` (inside the steps block).
   - Retain the single instance directly below the hero section in `src/pages/HomePage.tsx`.
   - Ensure both the landing page card and the menu drawer card consume the shared `fetchRunningCourse()` from `public.courses`.

5. **SQL Delivery (`/sql/fix-all.sql`)**:
   - Produce a single, fully idempotent SQL file using `IF NOT EXISTS`, `CREATE OR REPLACE`, and `DROP POLICY IF EXISTS`.
   - Include the backfill query to normalize existing stored phone numbers (`01...`) and lowercase emails.
   - Include step-by-step instructions for running in Supabase SQL Editor and verifying.

---

### 3. Technical Architecture & File Plan

- `/sql/fix-all.sql`: The complete idempotent database setup and backfill script.
- `src/services/auth.ts`: Normalization routines, RPC integration for quick sign-in, masked email hint handling, persistent session restoration.
- `src/components/AuthGuard.tsx`: Updated quick sign-in modal displaying the masked email hint ("Code sent to ro***@gmail.com") and appropriate error messaging.
- `src/services/courses.ts`: Migrated to direct `public.courses` queries, realtime subscriptions, window focus refetch, and no-store caching.
- `src/pages/AdminCheckPage.tsx`: Course manager writing directly to `public.courses` with batch name and running status toggles.
- `src/pages/WaitlistPage.tsx`: Integrated with `get_waitlist_directory` and `get_waitlist_counts` for privacy-compliant public directory viewing.
- `src/components/HomeSections.tsx`: Removed duplicate `RunningCourseCard`.
