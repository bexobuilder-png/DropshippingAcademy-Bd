# Implementation Plan - Dynamic Contact Section & Admin Contact Settings

## User Review Required
> [!IMPORTANT]
> Please review the plan below. Once you click Proceed, we will implement the dynamic contact system with Supabase Realtime sync, admin contact settings panel, visitor contact form submissions, and global smooth-scroll contact buttons.

## Proposed Changes

### 1. Database Schema & SQL Setup (`supabase/schema.sql` update)
- Add `contact_settings` table storing contact items: `id`, `type`, `label`, `value`, `visible`, `display_order`, `updated_at`.
- Add `contact_messages` table storing visitor form submissions: `id`, `name`, `contact_info`, `message`, `created_at`, `status`.
- Seed default initial contact items (Email: `rohit007jsr@gmail.com`, Phone, WhatsApp, Facebook, Telegram, Address, Office Hours).
- Configure Row Level Security (RLS) policies: public read for `contact_settings`, public insert for `contact_messages`, admin-only write/delete for `contact_settings` and `contact_messages`.

### 2. Services & Hooks (`src/services/contact.ts` & hooks)
- Create Supabase client helper functions for fetching and updating contact settings with Realtime subscriptions.
- Create helper functions to submit and fetch contact messages.
- Fallback cached/default data provider when offline or before database connection.

### 3. Public Contact Section & Form (`src/components/ContactSection.tsx` & `src/components/ContactKit.tsx`)
- Subscribe to real-time updates for contact items.
- Render dynamic contact cards with correct protocol handlers (`mailto:`, `tel:`, `wa.me`, external links).
- Interactive Contact Form with validation (name, email/phone, message), saving to Supabase and displaying success toast.
- Fully responsive design matching the site's Bangla/English theme.

### 4. Global Contact Button Navigation (`src/components/Navigation.tsx`, `Hero.tsx`, `Footer.tsx`, etc.)
- Update all "Contact" buttons across navbar (with mobile menu close), hero, footer, and floating buttons to smooth-scroll to `#contact-section` with a brief highlight animation.

### 5. Admin Panel - "Contact Settings" Page (`src/pages/AdminContactPage.tsx` or integrated into Admin panel)
- Protected by Supabase Auth (admin check).
- Editable card boxes for each contact item (Edit, Save, Cancel).
- Add new info modal/form with types (Email, Phone, WhatsApp, Facebook, Telegram, Website, Address, Custom).
- Reorder controls (Move Up / Move Down or order index) and Visibility toggle (Show/Hide).
- Delete with confirmation dialog and input format validation.
- Live preview pane mirroring the public contact section in real time.
- Messages viewer tab to inspect visitor submissions.

## Verification Plan
- **Automated Build Check**: Run `compile_applet` / `lint_applet` to verify TypeScript types and React build integrity.
- **Manual Verification**:
  - Test contact form submission and check Supabase insert.
  - Test admin editing, adding, reordering, and deleting contact items.
  - Verify real-time updates across multiple tabs.
  - Verify smooth-scrolling contact buttons across all locations.
