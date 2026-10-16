# Phase A Implementation Plan: Redirection, Blocked Registration & Celebration Pages

This implementation plan covers Phase A requirements for "Dropshipping Academy BD": enforcing session-based redirection rules, blocking registration for already logged-in users, adding the `/welcome` post-registration celebration page with 6-second countdown/animation, and displaying a 1.2-second "Welcome back" splash for returning visitors.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Redirection Rules**: Logged-in visitors to `/`, `/register`, `/join`, `/login` are automatically redirected to `/dashboard`. Unauthenticated visitors to `/dashboard` or `/profile` are redirected to `/login`.
> - **Already Registered Page**: 4-second countdown warning page when opening `/register` while logged in, with options to go to dashboard or log out.
> - **Welcome Celebration (`/welcome`)**: 6-second celebration animation with count-up queue number, seal pop tick, and confetti before auto-redirecting to dashboard.
> - **Welcome-Back Splash**: 1.2-second greeting splash shown once per browser session when returning to `/`.

---

## 1. Overview & Core Concept

- **What It Does**: Implements strict route guarding, server/client session validation, anti-duplicate registration checks (HTTP 409 / already registered warning), and celebratory post-registration animations.
- **Key Value**: Seamless, professional membership UX where logged-in students never see public marketing/registration forms again, while unauthenticated users are guided securely to login.

---

## 2. User Experience & Visual Design

- **Visual Theme**: Existing warm cream/orange/ink brand palette, 2px ink borders, hard offset shadows, Anek Bangla + Hind Siliguri typography.
- **Key Flows**:
  1. **Logged-in Root Access**: Visiting `/` shows a quick 1.2-second "Welcome back, [First Name]" splash, then loads dashboard home.
  2. **Already Registered Guard**: Opening `/register` while logged in displays an alert with a 4-second countdown, direct button to dashboard, and "Not you? Log out" link.
  3. **Post-Registration Celebration (`/welcome`)**: Displays 6-second celebratory animation with queue position count-up and confetti before redirecting to dashboard.
  4. **Dynamic Header & Navigation**: Replaces Register CTA with student avatar and Dashboard link when authenticated.

---

## 3. Technical Architecture & Data Strategy

- **Session State**: Managed via `getCurrentUserSession()` / `clearUserSession()` in `src/services/auth.ts`, backed by localStorage and HttpOnly cookies.
- **Route Guards**: Client-side and server proxy route guards (`/dashboard`, `/login`, `/register`, `/welcome`).
- **Animations**: CSS transitions respecting `prefers-reduced-motion`.
