# Course Catalog, Registration System & Admin Management Architecture

## Title & Summary
Transform the registration flow into a comprehensive Course Catalog & Enrollment system where clicking "রেজিস্ট্রেশন করুন" presents categorized courses with rich thumbnails, detailed descriptions, pricing, and enrollment buttons. Incorporate flexible enrollment models (promo-code exclusive vs. paid via bKash/Nagad TrxID), student registration forms, and an integrated Admin Panel to manage courses, promo codes, and student enrollment submissions.

## User Review & Critical Decisions
> [!IMPORTANT]
> The clarifying questions were skipped; the following battle-tested defaults have been adopted to fulfill all requirements smoothly:
- **Registration Action Flow**: Clicking "রেজিস্ট্রেশন করুন" opens a dedicated Course Catalog & Enrollment view with category filter tabs (ড্রপশিপিং ই-কমার্স, ড্রপশিপিং রিসেলার, ডিজিটাল মার্কেটিং, ইত্যাদি), rich thumbnails, and enrollment triggers.
- **Dual Enrollment Modes**: Admins can set courses as either **পেইড কোর্স (টাকা দিয়ে ভর্তি)** or **প্রমো কোড অনলি (শুধুমাত্র অ্যাডমিনের সেট করা প্রমো কোড দিয়ে জয়েন)**. If set to promo code, students must provide a valid active promo code to complete registration. If set to paid, students provide their bKash/Nagad sender number and TrxID.
- **Admin Panel Submissions**: Every student registration directly streams into the Admin Panel with student contact details, selected course, enrollment mode, promo code or TrxID, and one-click WhatsApp contact / approval actions.
- **Admin Authentication**: Accessible via the Navbar "অ্যাডমিন প্যানেল" button or discrete admin entrance protected by a secure PIN (`1234` by default with password option).

---

## 1. Overview & Core Concept
- **What It Does**:
  1. Visitors clicking "রেজিস্ট্রেশন করুন" in the Hero, Navbar, or Home sections see a categorized Course Catalog modal/view showcasing course cards with image thumbnails, category tags, batch labels, pricing, and an enrollment button.
  2. Clicking "ভর্তি হন / রেজিস্ট্রেশন করুন" on any course opens a streamlined student application form collecting Full Name, WhatsApp Number, Email, and District.
  3. Form adapts dynamically:
     - For **পেইড কোর্স**: Displays bKash/Nagad merchant instructions and accepts Sender Phone + TrxID.
     - For **প্রমো কোড অনলি কোর্স**: Accepts promo code, validates in real-time against active promo codes in the system, and allows admission only upon code match.
  4. Submitted registrations are saved to local persistent storage (and synced to database if connected) and immediately appear in the Admin Panel's "কোর্স রেজিস্ট্রেশন ও ভর্তি আবেদন" dashboard.
  5. In Admin Panel, admins can create new courses with custom thumbnails, set categories, configure pricing or toggle "শুধুমাত্র প্রমো কোড", create & distribute promo codes, and review student applications.

---

## 2. User Experience & Visual Design
- **Aesthetic Direction**: Clean Bengali EdTech theme matching the warm golden-orange (`#ff7722`) and ivory (`#fbf9ef`) palette, crisp borders, dark text (`#171412`), and retro ink badges.
- **Course Catalog View**:
  - Category Pills / Filter bar: "সব কোর্স", "ড্রপশিপিং ই-কমার্স ব্যবসা", "ড্রপশিপিং রিসেলার ব্যবসা", "ডিজিটাল মার্কেটিং".
  - Course Cards: High-res visual thumbnails (16:9 ratio), category indicator, title, batch badge, highlights list, pricing tag (e.g. `৳১,০০০` or `প্রমো কোড প্রয়োজন`), and high-contrast "ভর্তি হন" CTA.
- **Student Registration Modal**:
  - Modal overlay with course summary on top (thumbnail snippet + title + cost).
  - Clear input fields with error validation and Bangla labels.
  - Interactive Promo Code validator with instant feedback ("প্রোমো কোড সঠিক হয়েছে! 🎉" or "অকার্যকর কোড").
  - bKash/Nagad copy-number helper buttons with instant copied toast.
- **Admin Dashboard Tabs**:
  - **কোর্স ম্যানেজমেন্ট**: Add/Edit/Delete courses, upload thumbnail, toggle `isPromoOnly` vs `price`.
  - **প্রমো কোড ম্যানেজার**: Create promo codes, assign to courses or global, set discounts/free passes.
  - **শিক্ষার্থী রেজিস্ট্রেশন তালিকা**: Filter by course, status badges (পেন্ডিং, অনুমোদিত, বাতিল), view TrxID / promo code, and WhatsApp direct chat.

---

## 3. Key Product Decisions & Trade-Offs
- **Decision 1: Course Catalog as Modal + Dedicated Route**:
  - *Chosen Approach*: Implement `CourseCatalogModal` that can be triggered from any "রেজিস্ট্রেশন করুন" button across the app, while also syncing with `/courses` route for direct sharing.
  - *Why*: Allows instant enrollment without page unmount while maintaining deep linkability.
- **Decision 2: Dual Course Admission Model (Price vs. Promo-Code-Only)**:
  - *Chosen Approach*: Add `enrollmentType: 'payment' | 'promo_only' | 'both'` to `CourseItem`.
  - *Why*: Directly satisfies user requirement: "যেটাই প্রমো কোড দিব ওটাই শুধু প্রমো কোড দিয়ে জয়েন করতে পারবে। আর যেটা টাকা দেবো সেটাই টাকা দিয়ে জয়েন করতে পারবে।"
- **Decision 3: Persistent Registration Submissions**:
  - *Chosen Approach*: Create `src/services/enrollments.ts` backed by localStorage with instant reactivity and Supabase fallback.
  - *Why*: Ensures zero-latency registrations and immediate visibility in the Admin Panel without requiring external database provisioning.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       User Interface                        │
│                                                             │
│   Hero / Navbar / HomeSections                              │
│       │                                                     │
│       ▼ (Click 'রেজিস্ট্রেশন করুন')                          │
│   CourseCatalogModal                                        │
│   ├── Category Tabs (ই-কমার্স / রিসেলার / মার্কেটিং)           │
│   ├── Course Cards (Thumbnails, Pricing, Details)           │
│   └── 'ভর্তি হন' CTA Button                                 │
│       │                                                     │
│       ▼                                                     │
│   CourseRegistrationModal                                   │
│   ├── Student Contact Info (Name, Phone, Email, District)   │
│   ├── Dynamic Admission Branch:                             │
│   │   ├── If 'promo_only': Promo Code input & validation    │
│   │   └── If 'payment': bKash/Nagad Info + TrxID            │
│   └── Submit Application                                    │
│       │                                                     │
│       ▼                                                     │
│   Enrollment Service (Local Storage + Reactive State)       │
│       │                                                     │
│       ▼                                                     │
│   Admin Panel (AdminCheckPage)                              │
│   ├── Tab 1: Course Management (Thumbnails, Price, Promo)   │
│   ├── Tab 2: Promo Code Manager                             │
│   └── Tab 3: Student Enrollments List & Status Actions      │
└─────────────────────────────────────────────────────────────┘
```

### Data Schema Additions
1. **CourseItem**:
   - `thumbnailUrl?: string` (Preset or custom image URL)
   - `enrollmentType: 'payment' | 'promo_only' | 'both'`
   - `requiredPromoCode?: string`
2. **StudentEnrollment**:
   - `id: string`
   - `courseId: string`
   - `courseTitle: string`
   - `courseCategory: string`
   - `studentName: string`
   - `studentPhone: string`
   - `studentEmail: string`
   - `district: string`
   - `enrollmentType: 'payment' | 'promo_only'`
   - `promoCodeUsed?: string`
   - `paymentMethod?: 'bKash' | 'Nagad' | 'Rocket'`
   - `senderPhone?: string`
   - `trxId?: string`
   - `amountPaid?: number`
   - `status: 'pending' | 'approved' | 'rejected'`
   - `createdAt: string`
