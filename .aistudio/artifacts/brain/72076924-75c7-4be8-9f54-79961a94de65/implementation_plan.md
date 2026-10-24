# Move Promo Codes to Payment Step & Admin Promo Code Management

This feature relocates promo code entry from the initial registration form to the top of the Payment Page, implements real-time price updates with bilingual discount callouts, and provides full Admin controls to manage promo code caps, course restrictions, expiration dates, and usage limits.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed by the user in Phase 1:

- **Confirmed Decision 1 (Admin Discount Cap)**: Maximum discount percentage is strictly capped at 50%. The Admin Promo Code form enforces max 50% via client-side validation and server-side constraints.
- **Confirmed Decision 2 (Course Re-validation)**: If a student changes their course selection during checkout, the applied promo code automatically re-validates against the new course and clears with an inline message if non-applicable.
- **Confirmed Decision 3 (Payment Page Promo Display)**: Display live percentage discount badges ("20% OFF applied, you save ৳XXX") and discount details without crowding the payment UI with remaining limit counts.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Clean Registration Flow**: Simplifies the registration form (Name, Phone, Email, District) without distraction.
  2. **Payment Page Promo UI**: Relocates promo input to the top of the payment screen. Students enter a code, click "Apply", and instantly see strikethrough original pricing, large highlighted final prices, and a green savings badge.
  3. **Admin Promo Code Manager**: Enables admins to create custom promo codes (e.g. `EARLY20`), link them to specific courses or "All courses", set percentage discounts (up to 50%), define redemption caps (e.g. 50 uses), set expiry dates, toggle active/inactive status, and track redemption counters (`used_count / usage_limit`).
  4. **Server-Side Validation & Persistence**: Validates code rules server-side before payment and atomically increments redemption counts upon payment confirmation.

- **Target Audience**:
  - **Students**: Enrolling in Dropshipping Academy courses with a seamless 3-step checkout (Form → Email OTP → Payment).
  - **Admins & Founders**: Managing promotional campaigns, tracking redemption limits, and auditing student enrollments.

---

## 2. User Experience & Visual Design

### Registration Flow & Payment Checkout
1. **Step 1: Course Catalog & Registration Form**
   - Clean, focused form asking for Name, Phone, Email, District.
   - Removed promo code field from this step entirely.
   - Submitting triggers a 6-digit email OTP verification.
2. **Step 2: Email Verification (OTP)**
   - Minimalist OTP input screen.
   - Upon successful verification, user advances directly to Step 3 (Payment).
3. **Step 3: Payment Page (Promo-First Design)**
   - Top section displays Course Title & Original Price (`৳2,500`).
   - Clean Promo Input field with "Apply" button directly above payment methods (bKash / Nagad / Rocket).
   - **Applied Promo State**:
     - Original price shown with strikethrough (`৳2,500`).
     - Discounted price highlighted in large bold green (`৳2,000`).
     - Green Badge: `20% OFF applied · You save ৳500`.
     - Smooth "Remove Code" button to reset.
   - **Invalid/Expired Promo State**: Friendly red error message (`"Invalid or expired promo code" / "অকার্যকর বা মেয়াদোত্তীর্ণ প্রোমো কোড"`).

### Admin Panel: Promo Code Manager (`/check` route)
- Integrated into the existing Admin Control Center (`/check`).
- **Filter & Search Toolbar**: Search by promo code text, filter by course, and filter by status (Active / Inactive / Expired).
- **Promo Table**:
  - Code (e.g., `EARLY20` in monospace bold).
  - Applicable Course (Course name or "All Courses").
  - Discount % (e.g. `20% OFF` with max 50% badge).
  - Usage Counter (e.g. `12 / 50 uses`).
  - Expiry Date or "No Expiry".
  - Status Toggle (Active / Inactive pill button).
  - Actions: Edit & Delete buttons.
- **Create/Edit Promo Modal**:
  - Upper-cased Code input.
  - Course Selector (Specific course dropdown or "All Courses").
  - Discount Percentage slider/input (0–50% enforced).
  - Max Usage Limit input (e.g. 50).
  - Expiry Date Picker (Optional).
  - Active toggle switch.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Moving Promo Code Input to Payment Step**
  - *Chosen Approach*: Put promo input at the top of the Payment Page above payment methods.
  - *Why*: Reduces friction on the initial registration form while placing promo incentives right when the student is making their payment decision.
- **Decision 2: Strict 50% Cap on Admin Promo Percentage**
  - *Chosen Approach*: Validate max percentage <= 50% both in the admin form UI and server-side/service layer.
  - *Why*: Prevents accidental business loss from erroneous admin entries.
- **Decision 3: Atomic Usage Counter Increment**
  - *Chosen Approach*: Increment `used_count` in `promo_codes` table only after payment confirmation.
  - *Why*: Prevents usage limits from being consumed by uncompleted or abandoned payment steps.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Student Checkout Flow                            │
└─────────────────────────────────────────────────────────────────────────────┘
  1. Registration Form ──► 2. Email OTP Verify ──► 3. Payment Page
                                                         │
                                                         ▼
                                               ┌──────────────────┐
                                               │ Apply Promo Code │
                                               └─────────┬────────┘
                                                         │
                                                         ▼
                                               ┌──────────────────┐
                                               │ Server Validation│
                                               │  (evaluatePromo) │
                                               └─────────┬────────┘
                                                         │
                                               ┌─────────┴────────┐
                                               ▼                  ▼
                                        [ Valid Code ]     [ Invalid Code ]
                                               │                  │
                                        Live Price Update   Inline Error
                                        Strikethrough Old   Message
                                        Highlight Final
                                               │
                                               ▼
                                        Submit Payment (trxId, senderPhone)
                                               │
                                               ▼
                                   Atomic used_count++ Increment
                                   & Store Enrollment Record
```

### Data Schema (`supabase/schema.sql` & TypeScript models)

```sql
-- public.promo_codes table
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  applicable_course_id text default null, -- NULL means applicable to all courses
  percentage integer not null check (percentage >= 1 and percentage <= 50),
  max_percentage integer not null default 50,
  usage_limit integer not null default 100 check (usage_limit >= 1),
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz default null,
  is_active boolean not null default true,
  description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 5. Implementation Steps

1. **Database Schema & Services**:
   - Update `supabase/schema.sql` with `public.promo_codes` table and initial seed data.
   - Update `PromoCodeItem` interface in `src/config/courses.ts` to include `percentage`, `usageLimit`, `usedCount`, `expiresAt`, `applicableCourseId`.
   - Update `src/services/courses.ts` with server-side validation functions (`evaluatePromoCodeServerSide`) and atomic increment logic (`incrementPromoUsage`).
2. **Registration & Checkout Flow (`src/pages/RegistrationPage.tsx`)**:
   - Remove promo field from initial registration form.
   - Render promo input section at top of payment step with real-time recalculation, discount badge, strikethrough price, and bilingual messaging.
   - Pass applied promo code and final calculated price to enrollment submission and trigger usage increment.
3. **Admin Promo Manager (`src/pages/AdminCheckPage.tsx`)**:
   - Upgrade Admin Promos sub-tab to include search, course filters, status filter, usage limit counter, expiry dates, and strict 50% discount cap validation.
4. **Verification & Testing**:
   - Run `compile_applet` to verify no TypeScript or lint errors exist.
