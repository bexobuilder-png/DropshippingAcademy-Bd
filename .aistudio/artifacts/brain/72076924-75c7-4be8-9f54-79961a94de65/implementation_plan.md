# Mobile Menu Drawer, Real-Time Registration Status & Admin Course Management

A comprehensive upgrade to Dropshipping Academy BD delivering an animated side menu drawer with live user registration status, persistent session management, real-time running batch promotion cards, an authentic registered waiting list social proof directory, and enhanced admin controls for user status and batch lifecycles.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during interactive clarification and define the core functional boundaries of this release:

- **Confirmed Decision 1 (Auth Recovery)**: Returning users whose session has expired can quickly authenticate using their registered phone number or email with a 6-digit OTP verification modal, restoring their active session and status immediately.
- **Confirmed Decision 2 (Privacy on Waiting List)**: The "Registered Waiting List" page will strictly display **First Name Only** (e.g. "Tanvir", "Nusrat", "Rahim") paired with their official status badge (`Pending`, `Approved`, `Rejected`), protecting student contact information and privacy while delivering authentic social proof.
- **Confirmed Decision 3 (Running Course Placement)**: The active running course card (managed by the admin) will be displayed in two high-intent touchpoints on the landing page: **directly below the hero section** for immediate new-visitor awareness, and **pinned within the courses curriculum section** for in-depth evaluation, alongside its featured card inside the mobile Menu drawer.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms the static mobile bottom navigation into an integrated application hub. Tapping "Menu" slides in a refined side drawer from the right (~84% width) showing real-time applicant status, quick navigation anchors, the currently running academy batch card, language toggles, and access to the members-only Registered Waiting List. Administrators gain instant control to approve/reject applicants and orchestrate running batches with real-time site synchronization.
- **Target Audience / Persona**: Aspiring e-commerce and dropshipping entrepreneurs in Bangladesh navigating on mobile devices (360px–430px), looking for proof of active enrollment and clear visibility into their admission status.
- **Key Value**: Eliminates user anxiety after registration with real-time status transparency, boosts conversion through verified waiting list social proof, and gives academy operators frictionless tools to announce new batches and update student statuses.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Open Mobile Menu*: User taps "মেনু / Menu" on the fixed bottom bar. A darkened backdrop smoothly fades in as the drawer slides in from the right edge with a 400ms ease-out curve.
  2. *Status Block Check*: If signed in, the top card greets the user with their name and live status badge (`Pending` in warm amber, `Approved` in rich emerald green, `Rejected` in soft ruby red). If signed out, it clearly states `NOT AVAILABLE` with a 1-tap "Sign In / Register" trigger.
  3. *Waiting List Social Proof*: User taps "Registered Waiting List". If signed in, they see the aggregate applicant count and a searchable list of registered peers (first name + status). If unauthenticated, a friendly modal explains `"To access this information, you must register first."` with a primary button routing straight to the registration flow.
  4. *Running Course Discovery*: Visitors see the current running batch card in the drawer and across the homepage (under hero and in courses section) with an official "Running course" tag and direct navigation to enrollment.
  5. *Admin Course & User Management*: Admins can search users, toggle statuses via dropdown, create/edit batch courses, mark a batch as active/running, and toggle public visibility.

- **Visual Identity & Theme**:
  - *Color Palette & Mood*: Retains the signature warm cream canvas (`#fbf9ef`), deep espresso charcoal (`#171412`), brand orange accent (`#ff7722`), and rich brown typography (`#813502`).
  - *Status Badge Semantics*:
    - `Approved`: Emerald green text and background (`#059669` / `#ecfdf5` with subtle border `#a7f3d0`).
    - `Pending`: Warm amber text and background (`#d97706` / `#fffbeb` with subtle border `#fde68a`).
    - `Rejected`: Soft red text and background (`#dc2626` / `#fef2f2` with subtle border `#fecaca`).
  - *Typography & Ergonomics*: Mobile touch targets strictly $\ge 44\text{px}$. Left-aligned vertical navigation list with comfortable row spacing, active-state highlights, and bilingual Bangla/English labels.

- **Interactive Feedback & Motion**:
  - Drawer slide-in: `transform: translateX(0)` with 400ms cubic-bezier transition; backdrop blur `backdrop-blur-sm bg-black/40`.
  - Staggered item entrance: Menu items cascade smoothly with a 30ms offset.
  - Fully accessible: Focus trap, Esc key listener, swipe-to-dismiss gesture support, and immediate bypass when `prefers-reduced-motion` is active.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified Auth & Session Persistence**:
  - *Chosen Approach*: Maintain persistent user session state using localStorage key `da_auth_session_v1` synced with Supabase Auth when configured. Sign-out is strictly manual via the "Sign out" button in the drawer.
  - *Why*: Ensures users stay signed in through browser reloads, mobile multitasking, and device restarts, while gracefully supporting offline/preview modes.
  - *Alternatives Considered*: Pure session cookies (lost upon browser close on mobile devices) or transient memory (forces re-verification on every visit).

- **Decision 2: Real-Time Status Hydration on Drawer Open**:
  - *Chosen Approach*: Whenever the drawer opens (or on background Supabase/local changes), trigger a quick status fetch to display the latest admin-assigned status without reloading the page.
  - *Why*: Allows immediate visual feedback when an admin changes an applicant from Pending to Approved without requiring manual app refreshes.

- **Decision 3: Dedicated Waitlist Social Proof Route & Modal Guard**:
  - *Chosen Approach*: Route `/waitlist` wrapped in an `AuthGuard` or inline preview guard: authenticated users view the real-time list; unauthenticated users encounter the friendly registration prompt modal.
  - *Why*: Complies with user requirement 5 while transforming the waiting list into a high-converting registration incentive.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Application Shell                             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────┐                               ┌───────────────────┐
│ Navigation Bar   │ ── opens ──►                  │ MenuDrawer (84%)  │
│ (Bottom & Top)   │                               │ ├ Status Block    │
└──────────────────┘                               │ ├ Nav Links List  │
                                                   │ ├ Running Course  │
                                                   │ └ Waiting List CTA│
                                                   └─────────┬─────────┘
                                                             │
         ┌───────────────────────────────────────────────────┼────────────────────────────────────────┐
         ▼                                                   ▼                                        ▼
┌───────────────────┐                               ┌───────────────────┐                    ┌───────────────────┐
│ Auth & Session    │                               │ Courses & Batches │                    │ Registered Users  │
│ Service           │                               │ Service           │                    │ Waitlist Service  │
│ ├ Local + Supabase│                               │ ├ Admin CRUD      │                    │ ├ Status Update   │
│ └ Fast OTP Restore│                               │ ├ isRunning Flag  │                    │ └ Anonymized List │
└───────────────────┘                               └───────────────────┘                    └───────────────────┘
```

- **Data Models**:
  - `UserSession`: `{ id: string, name: string, email: string, phone: string, status: 'pending' | 'approved' | 'rejected', registeredAt: string }`
  - `CourseItem` extension: `isRunning?: boolean; isVisible?: boolean; batchName?: string; bannerUrl?: string;`
  - `WaitlistPublicRow`: `{ id: string, firstName: string, status: 'pending' | 'approved' | 'rejected', createdAt: string }`

- **Components to Create & Update**:
  - `src/components/MenuDrawer.tsx`: Reusable drawer with backdrop, focus trap, smooth transitions, status card, nav links, running batch card, and sign out.
  - `src/components/StatusBadge.tsx`: Polymorphic status badge with accessibility labels and amber/green/red variants.
  - `src/components/RunningCourseCard.tsx`: Reusable component rendering batch title, description, running tag, and "Learn more" action, usable in drawer and landing page.
  - `src/components/AuthGuard.tsx`: Modal & route wrapper protecting private waitlist data with friendly registration redirection.
  - `src/pages/WaitlistPage.tsx`: Publicly-safe social proof directory showing count and applicant statuses.
  - `src/pages/AdminCheckPage.tsx`: Enhanced user status dropdown, live search, and Course Batch CRUD with "mark as running" toggle.
  - `src/components/Hero.tsx` & `src/components/HomeSections.tsx`: Integrate the `RunningCourseCard` below the hero and in the curriculum section.
