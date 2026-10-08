# Dropshipping Academy — Waitlist Web Application

A mobile-first, Swiss-editorial ("Specimen" macrostructure) waitlist website for **Dropshipping Academy**, built with React 19, Vite, TypeScript, Tailwind CSS, React Router, Framer Motion (reduced-motion safe), Zod, `libphonenumber-js`, and Supabase Auth + Database (`@supabase/supabase-js`).

---

## Features & Architecture

1. **Brand Appart Editorial Design System**:
   - Light-only warm palette (`--bg: #fbf9ef`, `--base: #171412`, `--orange: #ff7722`, `--brown: #813502`, `--yellow: #ffc765`, `--purple: #3d2fa9`).
   - Display typography powered by **Bricolage Grotesque** (weights 700–800) paired with **Instrument Sans** (500/700) for UI and body copy.
   - 100% custom inline SVG illustrations, icons, flags, and badges in `src/components/svg/` (zero stock photos, zero external icon libraries, zero emojis).
2. **2-Step Email OTP Waitlist Flow (`/join`)**:
   - **Step 1**: Validates First Name, Last Name, 18+ Date of Birth (custom accessible calendar popover + typeable `DD/MM/YYYY`), international E.164 Phone & WhatsApp numbers (`libphonenumber-js`), Email, and Terms/Privacy consent using Zod (`src/schemas/waitlist.ts`).
   - **Step 2**: Dispatches a 6-digit email OTP via `supabase.auth.signInWithOtp`, verifies via `supabase.auth.verifyOtp`, inserts into `public.waitlist` under Row-Level Security (`user_id = auth.uid()`), handles duplicate registrations (`23505`) and rate limits (`429`), signs out, and redirects to `/waitlist-confirmed`.
3. **Editable Placeholders**:
   - **Founders**: Edit founder names, roles, bios, and story copy in `src/config/founders.ts`. Photos are stored at `src/assets/founders/founder-1.jpg` and `src/assets/founders/founder-2.jpg`.
   - **Benchmarks & Testimonials**: Toggle `PLACEHOLDER_CONTENT` and replace sample benchmark cards and preview quotes in `src/config/content.ts`.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your Supabase project URL and public anon key:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Provision the Supabase Database & RLS Policies

1. Open your Supabase project dashboard and go to the **SQL Editor**.
2. Paste and execute the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Email Templates**, open both the **Magic Link** and **Confirm signup** templates and paste the HTML from [`supabase/email-otp-template.html`](./supabase/email-otp-template.html) (which uses `{{ .Token }}` to render the 6-digit verification code in the Dropshipping Academy design system).

### 4. Run Development Server

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

### 5. Build for Production

```bash
npm run build
npm run lint
```
