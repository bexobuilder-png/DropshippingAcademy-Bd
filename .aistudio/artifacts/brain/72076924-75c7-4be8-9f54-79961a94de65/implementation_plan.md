# Dropshipping Academy BD: Phase 0 & Phase 1 Implementation Plan

This implementation plan covers Phase 0 (Unified Public Waitlist & Count Synchronization) and Phase 1 (Supabase Email OTP Login, Session Management, and Dashboard Integration) for "Dropshipping Academy BD".

## User Review & Critical Decisions

> [!IMPORTANT]
> All requirements confirmed during Phase 1 clarification have been incorporated:
> - **Waitlist Sync**: Unified `GET /api/waitlist/public` endpoint returning `{ total, items: [{ id, firstName, isYou }], nextCursor }`.
> - **Privacy & Filtering**: Verified & non-deleted only; privacy-toggled names rendered as "A student"; `isYou` computed securely on the server via session cookie.
> - **Authentication**: Supabase Auth email OTP login flow, auto-session creation on registration verification, and secure httpOnly cookies.
> - **UI Synchronization**: Immediate optimistic update on registration success followed by background refetch and periodic polling.

---

## 1. Overview & Core Concept

- **What It Does**: Unifies waitlist counting and public name display into a single bulletproof endpoint (`GET /api/waitlist/public`), and implements passwordless Supabase Email OTP login with session cookie protection for student dashboards.
- **Key Value**: Flawless count accuracy, 100% data privacy (first names only / "A student"), frictionless passwordless authentication, and real-time UI synchronization.

---

## 2. User Experience & Visual Design

- **Visual Theme**: Existing brand palette (`--bg #FCF9EE`, `--surface #F4F0E7`, `--ink #1B1610`, `--orange #EF7F3C`, `--yellow #F6C974`), 2px ink outlines, hard offset shadows, Anek Bangla + Hind Siliguri fonts, and light/dark mode support.
- **Key Flows**:
  1. **Registration & Auto-Login**: User registers with name, email, WhatsApp, DOB, language -> 6-digit email OTP verification -> auto-login session created -> immediate redirect to `/dashboard` with success toast and immediate waitlist inclusion with "YOU" tag.
  2. **Public Waitlist Screen**: Total count and paginated list (20 items/page + "Load more") fetched from `/api/waitlist/public`. Refreshed automatically on tab focus and every 60 seconds.
  3. **Login Screen (`/login`)**: Email input -> 6-digit OTP code boxes with auto-advance and paste support -> secure session establishment.
  4. **Navigation & Menu**: Dynamic header showing student first name and Dashboard link when logged in, or Login/Register when logged out.

---

## 3. Technical Architecture & Data Strategy

```
┌─────────────────────────┐          ┌─────────────────────────┐
│     Client (React)      │          │     Server (Express)    │
│  - /login & /dashboard  │◄────────►│  - /api/waitlist/public │
│  - Waitlist UI & Polls  │          │  - /api/auth/me         │
└─────────────────────────┘          └────────────┬────────────┘
                                                  │
                                                  ▼
                                     ┌─────────────────────────┐
                                     │ Supabase Database & Auth│
                                     │  - students table       │
                                     │  - RLS Policies & OTP   │
                                     └─────────────────────────┘
```

- **Data Models**:
  - `students`: `id`, `full_name`, `email`, `email_verified_at`, `whatsapp`, `dob`, `language`, `status`, `show_first_name`, `is_admin`, `created_at`.
  - `login_codes` / Supabase Auth OTP.
- **Security**: Server-side session verification via HttpOnly cookies, RLS policies on Supabase tables, rate-limiting on public endpoints.
