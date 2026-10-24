import { AdminContactForm } from "../components/ContactKit";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FounderProfile } from '../config/founders';
import {
  ALLOWED_ADMIN_EMAILS,
  compressImageFileToDataUrl,
  createFounder,
  deleteWaitlistEntry,
  fetchAllWaitlistUsers,
  fetchFoundersList,
  fetchSiteSectionContent,
  FounderStoryConfig,
  getAdminSessionEmail,
  loadFounderStoryConfig,
  NewFounderInput,
  removeAllFounders,
  removeFounderById,
  restoreDefaultFoundersList,
  saveFounderStoryConfig,
  saveSiteSectionContent,
  sendAdminLoginOtp,
  sendWaitlistStatusEmail,
  signOutAdmin,
  updateExistingFounder,
  updateWaitlistStatus,
  verifyAdminLoginOtp,
} from '../services/admin';
import {
  fetchCoursesList,
  saveCoursesList,
  deleteCourse,
  restoreDefaultCourses,
  fetchPromoCodesList,
  savePromoCodesList,
  restoreDefaultPromoCodes,
} from '../services/courses';
import {
  fetchStudentEnrollments,
  updateEnrollmentStatus,
  deleteStudentEnrollment,
  StudentEnrollment,
} from '../services/enrollments';
import {
  CourseItem,
  PromoCodeItem,
  DEFAULT_COURSES,
  DEFAULT_PROMO_CODES,
} from '../config/courses';
import {
  CURRICULUM_TABS_BN,
  CURRICULUM_TABS_EN,
  FAQ_ITEMS_BN,
  FAQ_ITEMS_EN,
  FEATURED_RESULTS_BN,
  FEATURED_RESULTS_EN,
  TESTIMONIALS_BN,
  TESTIMONIALS_EN,
  TOOL_CATEGORIES_BN,
  TOOL_CATEGORIES_EN,
  HERO_SLIDES_BN,
  HERO_SLIDES_EN,
  HeroSlideItem,
  WHY_CHOOSE_US_ITEMS_BN,
  WHY_CHOOSE_US_ITEMS_EN,
  WhyChooseUsItem,
  ToolCategoryItem,
  BentoResultItem,
  CurriculumTabItem,
  TestimonialItem,
  FaqItem,
} from '../config/content';
import { maskEmailAddress, WaitlistDbRow } from '../services/waitlist';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { OtpInput } from '../components/OtpInput';
import {
  AlertCircleSvgIcon,
  ArrowRightSvgIcon,
  CheckSvgIcon,
  DownloadSvgIcon,
} from '../components/svg/NavIcons';

const BACKDROP_COLORS = [
  { label: 'Brand Orange', value: '#ff7722' },
  { label: 'Warm Yellow', value: '#ffc765' },
  { label: 'Soft Peach', value: '#fbc59d' },
  { label: 'Editorial Purple', value: '#3d2fa9' },
];

const ROTATION_OPTIONS = [
  { label: 'Tilt Left (-4°)', value: '-rotate-3 md:-rotate-4' },
  { label: 'Tilt Right (+5°)', value: 'rotate-3 md:rotate-5' },
  { label: 'Straight (0°)', value: 'rotate-0' },
];

function calculateAge(isoDob: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDob)) return null;
  const [y, m, d] = isoDob.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
    age--;
  }
  return age;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const AdminCheckPage: React.FC = () => {
  const { t } = useLanguage();

  // Authentication state
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Control Center active tab
  const [activeTab, setActiveTab] = useState<'waitlist' | 'founders' | 'content' | 'courses' | 'contact'>('waitlist');
  const [contentLang, setContentLang] = useState<'bn' | 'en'>('bn');
  const [contentSubTab, setContentSubTab] = useState<
    'slider' | 'why-choose' | 'bento' | 'curriculum' | 'testimonials' | 'faq' | 'tools'
  >('slider');

  // Courses & Promo Codes Management State
  const [adminCourses, setAdminCourses] = useState<CourseItem[]>(DEFAULT_COURSES);
  const [adminPromoCodes, setAdminPromoCodes] = useState<PromoCodeItem[]>(DEFAULT_PROMO_CODES);
  const [coursesSubTab, setCoursesSubTab] = useState<'courses' | 'promos' | 'enrollments'>('courses');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [courseFeedback, setCourseFeedback] = useState<string>('');
  const [isSavingCourses, setIsSavingCourses] = useState<boolean>(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Student Enrollments State
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [courseForm, setCourseForm] = useState<{
    title: string;
    batchName: string;
    category: string;
    subtitle: string;
    description: string;
    price: number;
    discountPrice: number;
    duration: string;
    highlights: string;
    badge: string;
    isActive: boolean;
    isRunning: boolean;
    isVisible: boolean;
    thumbnailUrl: string;
    enrollmentType: 'payment' | 'promo_only' | 'both';
    requiredPromoCode: string;
  }>({
    title: '',
    batchName: '',
    category: 'ড্রপশিপিং রিসেলিং',
    subtitle: '',
    description: '',
    price: 1000,
    discountPrice: 1000,
    duration: '৮ সপ্তাহ · লাইভ ক্লাস ও প্রজেক্ট',
    highlights: '',
    badge: '',
    isActive: true,
    isRunning: false,
    isVisible: true,
    thumbnailUrl: '/images/course_dropshipping_basic_1791567728755.jpg',
    enrollmentType: 'payment',
    requiredPromoCode: '',
  });

  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoSearchQuery, setPromoSearchQuery] = useState<string>('');
  const [promoCourseFilter, setPromoCourseFilter] = useState<string>('ALL');
  const [promoStatusFilter, setPromoStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [promoForm, setPromoForm] = useState<{
    code: string;
    applicableCourseId: string;
    percentage: number;
    usageLimit: number;
    expiresAt: string;
    description: string;
    isActive: boolean;
  }>({
    code: '',
    applicableCourseId: 'ALL',
    percentage: 20,
    usageLimit: 50,
    expiresAt: '',
    description: '',
    isActive: true,
  });

  // Assign user course modal state
  const [assignUserModal, setAssignUserModal] = useState<WaitlistDbRow | null>(null);
  const [assignCourseId, setAssignCourseId] = useState<string>('');

  const [adminHeroSlides, setAdminHeroSlides] = useState<HeroSlideItem[]>(HERO_SLIDES_BN);
  const [adminWhyChoose, setAdminWhyChoose] = useState<WhyChooseUsItem[]>(WHY_CHOOSE_US_ITEMS_BN);
  const [adminTools, setAdminTools] = useState<ToolCategoryItem[]>(TOOL_CATEGORIES_BN);
  const [adminBento, setAdminBento] = useState<BentoResultItem[]>(FEATURED_RESULTS_BN);
  const [adminCurriculum, setAdminCurriculum] = useState<CurriculumTabItem[]>(CURRICULUM_TABS_BN);
  const [adminTestimonials, setAdminTestimonials] = useState<TestimonialItem[]>(TESTIMONIALS_BN);
  const [adminFaqs, setAdminFaqs] = useState<FaqItem[]>(FAQ_ITEMS_BN);
  const [siteContentNotice, setSiteContentNotice] = useState('');
  const [isSavingSection, setIsSavingSection] = useState(false);

  useEffect(() => {
    if (!adminEmail) return;
    const langKey = contentLang;
    Promise.all([
      fetchSiteSectionContent(`hero_slides_${langKey}`, langKey === 'bn' ? HERO_SLIDES_BN : HERO_SLIDES_EN),
      fetchSiteSectionContent(`why_choose_us_${langKey}`, langKey === 'bn' ? WHY_CHOOSE_US_ITEMS_BN : WHY_CHOOSE_US_ITEMS_EN),
      fetchSiteSectionContent(`tool_categories_${langKey}`, langKey === 'bn' ? TOOL_CATEGORIES_BN : TOOL_CATEGORIES_EN),
      fetchSiteSectionContent(`featured_results_${langKey}`, langKey === 'bn' ? FEATURED_RESULTS_BN : FEATURED_RESULTS_EN),
      fetchSiteSectionContent(`curriculum_tabs_${langKey}`, langKey === 'bn' ? CURRICULUM_TABS_BN : CURRICULUM_TABS_EN),
      fetchSiteSectionContent(`testimonials_${langKey}`, langKey === 'bn' ? TESTIMONIALS_BN : TESTIMONIALS_EN),
      fetchSiteSectionContent(`faq_items_${langKey}`, langKey === 'bn' ? FAQ_ITEMS_BN : FAQ_ITEMS_EN),
    ]).then(([slidesData, whyData, toolsData, bentoData, currData, testData, faqData]) => {
      setAdminHeroSlides(slidesData);
      setAdminWhyChoose(whyData);
      setAdminTools(toolsData);
      setAdminBento(bentoData);
      setAdminCurriculum(currData);
      setAdminTestimonials(testData);
      setAdminFaqs(faqData);
    });
  }, [adminEmail, contentLang]);

  const handleSaveSectionData = async (sectionBaseKey: string, data: any) => {
    setIsSavingSection(true);
    setSiteContentNotice('');
    const fullKey = sectionBaseKey.endsWith(`_${contentLang}`)
      ? sectionBaseKey
      : `${sectionBaseKey}_${contentLang}`;
    const res = await saveSiteSectionContent(fullKey, data);
    setIsSavingSection(false);
    if (!res.success) {
      setSiteContentNotice(`Failed to save: ${res.error || 'Unknown error'}`);
    } else {
      setSiteContentNotice(
        t(
          `"${fullKey}" (${contentLang.toUpperCase()}) সফলভাবে সংরক্ষণ করা হয়েছে এবং সমস্ত ডিভাইসে সিঙ্ক হয়েছে!`,
          `Successfully saved "${fullKey}" (${contentLang.toUpperCase()}) & synced across all devices!`
        )
      );
      window.dispatchEvent(new Event('site-content-updated'));
      setTimeout(() => setSiteContentNotice(''), 4500);
    }
  };

  // Waitlist Data State
  const [waitlistRows, setWaitlistRows] = useState<WaitlistDbRow[]>([]);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'contacted'
  >('all');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [csvExportNotice, setCsvExportNotice] = useState('');

  // Email Notification & Custom Status Update Modal State
  const [emailModalUser, setEmailModalUser] = useState<WaitlistDbRow | null>(null);
  const [emailModalAction, setEmailModalAction] = useState<'approved' | 'rejected'>('approved');
  const [emailModalSubject, setEmailModalSubject] = useState('');
  const [emailModalCustomMessage, setEmailModalCustomMessage] = useState('');
  const [emailModalSendEmail, setEmailModalSendEmail] = useState(true);
  const [isSendingStatusEmail, setIsSendingStatusEmail] = useState(false);
  const [emailStatusFeedback, setEmailStatusFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Founders Control Center State
  const [founders, setFounders] = useState<FounderProfile[]>([]);
  const [editingFounderId, setEditingFounderId] = useState<string | null>(null);
  const [confirmDeleteAllFounders, setConfirmDeleteAllFounders] = useState(false);
  const [founderFeedback, setFounderFeedback] = useState('');
  const [founderFormError, setFounderFormError] = useState('');
  const [isSavingFounder, setIsSavingFounder] = useState(false);

  const [founderForm, setFounderForm] = useState<NewFounderInput>({
    name: '',
    role: '',
    specialty: '',
    shortBio: '',
    photo: '',
    backdropColor: '#ff7722',
    rotationClass: '-rotate-3 md:-rotate-4',
  });

  // Founder Section Story Editor State
  const [storyForm, setStoryForm] = useState<FounderStoryConfig>(() =>
    loadFounderStoryConfig()
  );
  const [storySavedMsg, setStorySavedMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const founderEditorRef = useRef<HTMLDivElement>(null);

  // Check active admin session on mount
  useEffect(() => {
    let mounted = true;
    getAdminSessionEmail().then((email) => {
      if (!mounted) return;
      setAdminEmail(email);
      setCheckingAuth(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Load waitlist and founders once authenticated
  useEffect(() => {
    if (!adminEmail) return;
    loadDashboardData();
  }, [adminEmail]);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const loadDashboardData = async () => {
    setLoadingWaitlist(true);
    setWaitlistError('');
    const [waitlistRes, foundersRes, coursesRes, promoRes, enrollmentsRes] = await Promise.all([
      fetchAllWaitlistUsers(),
      fetchFoundersList(),
      fetchCoursesList(),
      fetchPromoCodesList(),
      fetchStudentEnrollments(),
    ]);
    setWaitlistRows(waitlistRes.rows);
    if (waitlistRes.error) {
      setWaitlistError(waitlistRes.error);
    }
    setFounders(foundersRes);
    setAdminCourses(coursesRes);
    setAdminPromoCodes(promoRes);
    setStudentEnrollments(enrollmentsRes);
    setLoadingWaitlist(false);
  };

  useEffect(() => {
    const handleEnrollmentUpdate = () => {
      fetchStudentEnrollments().then((list) => setStudentEnrollments(list));
    };
    window.addEventListener('student-enrollments-updated', handleEnrollmentUpdate);
    return () => {
      window.removeEventListener('student-enrollments-updated', handleEnrollmentUpdate);
    };
  }, []);

  // ============================================================================
  // ADMIN AUTH HANDLERS
  // ============================================================================
  const handleSendAdminOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingOtp) return;

    setAuthError('');
    setAuthNotice('');
    setIsSendingOtp(true);

    const res = await sendAdminLoginOtp(emailInput);
    setIsSendingOtp(false);

    if (!res.success) {
      setAuthError(res.error || 'Could not send verification code.');
      return;
    }

    setOtpInput('');
    setResendCooldown(60);
    setLoginStep(2);
  };

  const handleVerifyAdminOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifyingOtp) return;

    setAuthError('');
    setIsVerifyingOtp(true);

    const res = await verifyAdminLoginOtp(emailInput, otpInput);
    setIsVerifyingOtp(false);

    if (!res.success || !res.adminEmail) {
      setAuthError(res.error || 'Invalid 6-digit verification code.');
      return;
    }

    setAdminEmail(res.adminEmail);
  };

  const handleResendAdminOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setAuthError('');
    setAuthNotice('');
    setIsSendingOtp(true);

    const res = await sendAdminLoginOtp(emailInput);
    setIsSendingOtp(false);

    if (!res.success) {
      setAuthError(res.error || 'Failed to resend code.');
      return;
    }

    setResendCooldown(60);
    setAuthNotice('A new 6-digit login code has been sent to your email.');
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setAdminEmail(null);
    setLoginStep(1);
    setOtpInput('');
  };

  // ============================================================================
  // WAITLIST HANDLERS
  // ============================================================================
  const filteredWaitlist = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return waitlistRows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (courseFilter !== 'all') {
        if (courseFilter === 'none' && (row.course_title || row.course_id)) return false;
        if (courseFilter !== 'none' && row.course_id !== courseFilter && row.course_title !== courseFilter) return false;
      }
      if (!q) return true;
      const fullName = `${row.first_name} ${row.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.whatsapp.toLowerCase().includes(q) ||
        (row.course_title && row.course_title.toLowerCase().includes(q)) ||
        (row.promo_code && row.promo_code.toLowerCase().includes(q))
      );
    });
  }, [waitlistRows, searchQuery, statusFilter, courseFilter]);

  const metrics = useMemo(() => {
    const total = waitlistRows.length;
    const pending = waitlistRows.filter((r) => r.status === 'pending').length;
    const approved = waitlistRows.filter((r) => r.status === 'approved').length;
    const rejected = waitlistRows.filter((r) => r.status === 'rejected').length;
    const contacted = waitlistRows.filter((r) => r.status === 'contacted').length;
    return { total, pending, approved, rejected, contacted };
  }, [waitlistRows]);

  const openEmailModal = (
    user: WaitlistDbRow,
    action: 'approved' | 'rejected'
  ) => {
    setEmailModalUser(user);
    setEmailModalAction(action);
    setEmailModalSendEmail(true);
    setShowEmailPreview(false);

    if (action === 'approved') {
      setEmailModalSubject('অভিনন্দন! ড্রপশিপিং একাডেমিতে আপনার আবেদন অনুমোদিত হয়েছে 🎉');
      setEmailModalCustomMessage(
        'আপনার প্রোফাইল ও উদ্যোক্তা হওয়ার আগ্রহ পর্যালোচনা করে কোহর্ট ০১ ব্যাচে আপনার আবেদন অনুমোদিত করা হয়েছে। পরবর্তী ৪৮ ঘণ্টার মধ্যে বিস্তারিত অনবোর্ডিং নির্দেশনা ও ব্যাচ শিডিউল পাঠানো হবে।'
      );
    } else {
      setEmailModalSubject('ড্রপশিপিং একাডেমি আবেদন সংক্রান্ত আপডেট 📋');
      setEmailModalCustomMessage(
        'সীমিত আসন ও ব্যাপক সংখ্যক প্রার্থীর কারণে এই কোহর্টে আপনার আবেদনটি এই মুহূর্তে বিবেচনা করা সম্ভব হয়নি। পরবর্তী কোহর্টে আবেদনের জন্য আপনাকে আন্তরিক অনুরোধ জানাচ্ছি।'
      );
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: 'pending' | 'approved' | 'rejected' | 'contacted'
  ) => {
    if (newStatus === 'approved' || newStatus === 'rejected') {
      const user = waitlistRows.find((r) => r.id === id);
      if (user) {
        openEmailModal(user, newStatus);
        return;
      }
    }

    setWaitlistRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: newStatus } : row))
    );
    await updateWaitlistStatus(id, newStatus);
  };

  const handleConfirmStatusAndEmail = async () => {
    if (!emailModalUser) return;
    setIsSendingStatusEmail(true);
    setEmailStatusFeedback(null);

    const targetUser = emailModalUser;
    const action = emailModalAction;
    const sendEmail = emailModalSendEmail;
    const customMessage = emailModalCustomMessage.trim();
    const subject = emailModalSubject.trim();

    // 1. Update Database & Local state
    setWaitlistRows((prev) =>
      prev.map((row) => (row.id === targetUser.id ? { ...row, status: action } : row))
    );
    await updateWaitlistStatus(targetUser.id, action);

    // 2. Dispatch Bangla email via Nodemailer if checked
    let emailResultText = '';
    if (sendEmail) {
      const mailRes = await sendWaitlistStatusEmail({
        email: targetUser.email,
        firstName: targetUser.first_name,
        lastName: targetUser.last_name,
        action,
        customMessage,
        subject,
      });

      if (mailRes.success) {
        emailResultText = mailRes.simulated
          ? ' (ইমেইল সিমুলেট করা হয়েছে)'
          : ' (বাংলা আপডেট ইমেইল সফলভাবে পাঠানো হয়েছে)';
      } else {
        emailResultText = ` (ইমেইল পাঠাতে ত্রুটি: ${mailRes.error})`;
      }
    }

    setIsSendingStatusEmail(false);
    setEmailModalUser(null);

    const actionText = action === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত';
    setEmailStatusFeedback({
      type: 'success',
      message: `"${targetUser.first_name} ${targetUser.last_name}"-এর আবেদন সফলভাবে ${actionText} করা হয়েছে${emailResultText}।`,
    });
    setTimeout(() => setEmailStatusFeedback(null), 6000);
  };

  const handleDeleteUser = async (id: string) => {
    setWaitlistRows((prev) => prev.filter((row) => row.id !== id));
    setConfirmDeleteUserId(null);
    await deleteWaitlistEntry(id);
  };

  const handleExportCsv = (scope: 'all' | 'filtered' = 'all') => {
    const targetRows = scope === 'filtered' ? filteredWaitlist : waitlistRows;
    const headers = [
      'Row Number',
      'Applicant ID',
      'First Name',
      'Last Name',
      'Full Name',
      'Enrolled Course',
      'Course Fee (BDT)',
      'Promo Code Applied',
      'Final Fee (BDT)',
      'Email Address',
      'Phone Number',
      'WhatsApp Number',
      'Date of Birth',
      'Age (Years)',
      'Consent Accepted',
      'Application Status',
      'Supabase User ID',
      'Joined At (ISO)',
    ];
    const escapeCsv = (val: string | number | boolean | null | undefined) =>
      `"${String(val ?? '').replace(/"/g, '""')}"`;

    const lines = [
      headers.join(','),
      ...targetRows.map((r, index) => {
        const age = calculateAge(r.date_of_birth);
        return [
          escapeCsv(index + 1),
          escapeCsv(r.id),
          escapeCsv(r.first_name),
          escapeCsv(r.last_name),
          escapeCsv(`${r.first_name} ${r.last_name}`),
          escapeCsv(r.course_title || 'Pending Selection'),
          escapeCsv(r.course_fee || ''),
          escapeCsv(r.promo_code || ''),
          escapeCsv(r.final_fee !== undefined ? r.final_fee : (r.course_fee || '')),
          escapeCsv(r.email),
          escapeCsv(r.phone),
          escapeCsv(r.whatsapp),
          escapeCsv(r.date_of_birth),
          escapeCsv(age !== null ? age : ''),
          escapeCsv(r.consent_accepted ? 'Yes' : 'No'),
          escapeCsv(r.status),
          escapeCsv(r.user_id),
          escapeCsv(r.created_at),
        ].join(',');
      }),
    ];

    // Prepend UTF-8 BOM (\uFEFF) so Excel & Google Sheets open Bangla characters and +phone numbers cleanly
    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `dropshipping-academy-waitlist-${scope}-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCsvExportNotice(
      t(
        `${targetRows.length} জন ওয়েটলিস্ট ব্যবহারকারীর তথ্য CSV ফাইলে ডাউনলোড হয়েছে।`,
        `Exported ${targetRows.length} waitlist record(s) to CSV for external analysis.`
      )
    );
    setTimeout(() => setCsvExportNotice(''), 4500);
  };

  // ============================================================================
  // COURSE & PROMO CODE MANAGEMENT HANDLERS
  // ============================================================================
  const openNewCourseModal = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: '',
      batchName: '',
      category: 'ড্রপশিপিং রিসেলিং',
      subtitle: '',
      description: '',
      price: 1000,
      discountPrice: 1000,
      duration: '৮ সপ্তাহ · লাইভ ক্লাস ও প্রজেক্ট',
      highlights: '',
      badge: '',
      isActive: true,
      isRunning: false,
      isVisible: true,
      thumbnailUrl: '/images/course_dropshipping_basic_1791567728755.jpg',
      enrollmentType: 'payment',
      requiredPromoCode: '',
    });
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course: CourseItem) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title,
      batchName: course.batchName || '',
      category: course.category,
      subtitle: course.subtitle,
      description: course.description,
      price: course.price,
      discountPrice: course.discountPrice !== undefined ? course.discountPrice : course.price,
      duration: course.duration,
      highlights: course.highlights.join('\n'),
      badge: course.badge || '',
      isActive: course.isActive,
      isRunning: Boolean(course.isRunning),
      isVisible: course.isVisible !== false,
      thumbnailUrl: course.thumbnailUrl || '/images/course_dropshipping_basic_1791567728755.jpg',
      enrollmentType: course.enrollmentType || 'payment',
      requiredPromoCode: course.requiredPromoCode || '',
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      alert('Course title is required.');
      return;
    }

    setIsSavingCourses(true);
    const splitHighlights = courseForm.highlights
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedCourses: CourseItem[];
    if (editingCourseId) {
      updatedCourses = adminCourses.map((c) => {
        if (c.id === editingCourseId) {
          return {
            ...c,
            title: courseForm.title.trim(),
            batchName: courseForm.batchName.trim() || undefined,
            category: courseForm.category.trim() || 'ড্রপশিপিং রিসেলিং',
            subtitle: courseForm.subtitle.trim(),
            description: courseForm.description.trim(),
            price: Number(courseForm.price) || 1000,
            discountPrice: Number(courseForm.discountPrice) || Number(courseForm.price) || 1000,
            duration: courseForm.duration.trim() || '৮ সপ্তাহ · লাইভ ক্লাস',
            highlights: splitHighlights.length > 0 ? splitHighlights : c.highlights,
            badge: courseForm.badge.trim() || undefined,
            isActive: courseForm.isActive,
            isRunning: courseForm.isRunning,
            isVisible: courseForm.isVisible,
            thumbnailUrl: courseForm.thumbnailUrl.trim() || undefined,
            enrollmentType: courseForm.enrollmentType as 'payment' | 'promo_only',
            requiredPromoCode: courseForm.requiredPromoCode.trim() || undefined,
          };
        }
        // If this course is being marked as running, unmark other courses
        if (courseForm.isRunning) {
          return { ...c, isRunning: false };
        }
        return c;
      });
    } else {
      const newCourse: CourseItem = {
        id: `course-${Date.now()}`,
        title: courseForm.title.trim(),
        batchName: courseForm.batchName.trim() || undefined,
        category: courseForm.category.trim() || 'ড্রপশিপিং রিসেলিং',
        subtitle: courseForm.subtitle.trim(),
        description: courseForm.description.trim(),
        price: Number(courseForm.price) || 1000,
        discountPrice: Number(courseForm.discountPrice) || Number(courseForm.price) || 1000,
        promoCodeEligible: true,
        duration: courseForm.duration.trim() || '৮ সপ্তাহ · লাইভ ক্লাস',
        highlights: splitHighlights.length > 0 ? splitHighlights : ['হ্যান্ডস-অন প্রজেক্ট ও লাইভ সাপোর্ট'],
        badge: courseForm.badge.trim() || undefined,
        isActive: courseForm.isActive,
        isRunning: courseForm.isRunning,
        isVisible: courseForm.isVisible,
        thumbnailUrl: courseForm.thumbnailUrl.trim() || undefined,
        enrollmentType: courseForm.enrollmentType,
        requiredPromoCode: courseForm.requiredPromoCode.trim() || undefined,
        sortOrder: adminCourses.length + 1,
      };

      if (courseForm.isRunning) {
        updatedCourses = adminCourses.map((c) => ({ ...c, isRunning: false }));
        updatedCourses.push(newCourse);
      } else {
        updatedCourses = [...adminCourses, newCourse];
      }
    }

    setAdminCourses(updatedCourses);
    await saveCoursesList(updatedCourses);
    setIsSavingCourses(false);
    setIsCourseModalOpen(false);
    setCourseFeedback(
      editingCourseId
        ? `কোর্স "${courseForm.title.trim()}" সফলভাবে আপডেট করা হয়েছে!`
        : `নতুন কোর্স "${courseForm.title.trim()}" সফলভাবে যুক্ত করা হয়েছে!`
    );
    setTimeout(() => setCourseFeedback(''), 5000);
  };

  const handleApproveEnrollment = async (id: string) => {
    await updateEnrollmentStatus(id, 'approved');
    const updated = await fetchStudentEnrollments();
    setStudentEnrollments(updated);
  };

  const handleRejectEnrollment = async (id: string) => {
    await updateEnrollmentStatus(id, 'rejected');
    const updated = await fetchStudentEnrollments();
    setStudentEnrollments(updated);
  };

  const handleDeleteEnrollment = async (id: string) => {
    if (window.confirm('আবেদনটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      await deleteStudentEnrollment(id);
      const updated = await fetchStudentEnrollments();
      setStudentEnrollments(updated);
    }
  };

  const handleSetRunningCourse = async (courseId: string) => {
    const updated = adminCourses.map((c) => ({
      ...c,
      isRunning: c.id === courseId,
    }));
    setAdminCourses(updated);
    await saveCoursesList(updated);
    const target = updated.find((c) => c.id === courseId);
    setCourseFeedback(
      `"${target?.batchName || target?.title}"-কে সফলভাবে প্রধান চলতি কোর্স (Running Course) হিসেবে নির্ধারণ করা হয়েছে!`
    );
    setTimeout(() => setCourseFeedback(''), 4500);
  };

  const handleToggleCourseVisibility = async (courseId: string) => {
    const updated = adminCourses.map((c) =>
      c.id === courseId ? { ...c, isVisible: c.isVisible === false ? true : false } : c
    );
    setAdminCourses(updated);
    await saveCoursesList(updated);
  };

  const handleDeleteCourse = async (courseId: string) => {
    const updated = adminCourses.filter((c) => c.id !== courseId);
    setAdminCourses(updated);
    await deleteCourse(courseId);
    setCourseFeedback('কোর্সটি সফলভাবে মুছে ফেলা হয়েছে।');
    setTimeout(() => setCourseFeedback(''), 4000);
  };

  const handleToggleCourseActive = async (courseId: string) => {
    const updated = adminCourses.map((c) =>
      c.id === courseId ? { ...c, isActive: !c.isActive } : c
    );
    setAdminCourses(updated);
    await saveCoursesList(updated);
  };

  const handleRestoreDefaultCoursesList = async () => {
    const defaults = await restoreDefaultCourses();
    setAdminCourses(defaults);
    setCourseFeedback('ডিফল্ট ৩টি কোর্স পুনরুদ্ধার করা হয়েছে।');
    setTimeout(() => setCourseFeedback(''), 4000);
  };

  // Promo Handlers
  const openNewPromoModal = () => {
    setEditingPromoId(null);
    setPromoForm({
      code: '',
      applicableCourseId: 'ALL',
      percentage: 20,
      usageLimit: 50,
      expiresAt: '',
      description: '',
      isActive: true,
    });
    setIsPromoModalOpen(true);
  };

  const openEditPromoModal = (promo: PromoCodeItem) => {
    setEditingPromoId(promo.id);
    setPromoForm({
      code: promo.code,
      applicableCourseId: promo.applicableCourseId || 'ALL',
      percentage: Math.min(50, promo.percentage || 20),
      usageLimit: promo.usageLimit || 50,
      expiresAt: promo.expiresAt || '',
      description: promo.description || '',
      isActive: promo.isActive,
    });
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code.trim()) {
      alert('Promo code is required.');
      return;
    }

    const cleanCode = promoForm.code.trim().toUpperCase();
    const cleanPercentage = Math.min(50, Math.max(0, Number(promoForm.percentage) || 0));

    let updatedPromos: PromoCodeItem[];

    if (editingPromoId) {
      updatedPromos = adminPromoCodes.map((p) =>
        p.id === editingPromoId
          ? {
              ...p,
              code: cleanCode,
              discountType: 'percentage' as const,
              discountValue: cleanPercentage,
              percentage: cleanPercentage,
              maxPercentage: 50,
              usageLimit: Number(promoForm.usageLimit) || 50,
              applicableCourseId: promoForm.applicableCourseId || 'ALL',
              expiresAt: promoForm.expiresAt.trim() || undefined,
              description: promoForm.description.trim(),
              isActive: promoForm.isActive,
            }
          : p
      );
    } else {
      const newPromo: PromoCodeItem = {
        id: `promo-${Date.now()}`,
        code: cleanCode,
        discountType: 'percentage',
        discountValue: cleanPercentage,
        percentage: cleanPercentage,
        maxPercentage: 50,
        usageLimit: Number(promoForm.usageLimit) || 50,
        usedCount: 0,
        applicableCourseId: promoForm.applicableCourseId || 'ALL',
        expiresAt: promoForm.expiresAt.trim() || undefined,
        description: promoForm.description.trim(),
        isActive: promoForm.isActive,
      };
      updatedPromos = [...adminPromoCodes, newPromo];
    }

    setAdminPromoCodes(updatedPromos);
    await savePromoCodesList(updatedPromos);
    setIsPromoModalOpen(false);
    setCourseFeedback(`প্রোমো কোড "${cleanCode}" (${cleanPercentage}% discount) সফলভাবে সংরক্ষিত হয়েছে!`);
    setTimeout(() => setCourseFeedback(''), 5000);
  };

  const handleDeletePromo = async (promoId: string) => {
    const updated = adminPromoCodes.filter((p) => p.id !== promoId);
    setAdminPromoCodes(updated);
    await savePromoCodesList(updated);
    setCourseFeedback('প্রোমো কোড মুছে ফেলা হয়েছে।');
    setTimeout(() => setCourseFeedback(''), 4000);
  };

  const handleRestoreDefaultPromosList = async () => {
    const defaults = await restoreDefaultPromoCodes();
    setAdminPromoCodes(defaults);
    setCourseFeedback('ডিফল্ট প্রোমো কোডসমূহ পুনরুদ্ধার করা হয়েছে।');
    setTimeout(() => setCourseFeedback(''), 4000);
  };

  // Direct Assign Course to Applicant
  const handleAssignUserCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserModal || !assignCourseId) return;

    const targetCourse = adminCourses.find((c) => c.id === assignCourseId);
    if (!targetCourse) return;

    const baseFee = targetCourse.discountPrice !== undefined ? targetCourse.discountPrice : targetCourse.price;

    setWaitlistRows((prev) =>
      prev.map((r) =>
        r.id === assignUserModal.id
          ? {
              ...r,
              course_id: targetCourse.id,
              course_title: targetCourse.title,
              course_fee: baseFee,
              final_fee: baseFee,
            }
          : r
      )
    );

    // Save to local storage waitlist
    try {
      const raw = localStorage.getItem('da_local_waitlist_entries_v1');
      if (raw) {
        const list: WaitlistDbRow[] = JSON.parse(raw);
        const nextList = list.map((item) =>
          item.id === assignUserModal.id || item.email.toLowerCase() === assignUserModal.email.toLowerCase()
            ? {
                ...item,
                course_id: targetCourse.id,
                course_title: targetCourse.title,
                course_fee: baseFee,
                final_fee: baseFee,
              }
            : item
        );
        localStorage.setItem('da_local_waitlist_entries_v1', JSON.stringify(nextList));
      }
    } catch {
      // Ignore
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('waitlist')
          .update({
            course_id: targetCourse.id,
            course_title: targetCourse.title,
            course_fee: baseFee,
            final_fee: baseFee,
          })
          .eq('id', assignUserModal.id);
      } catch {
        // Ignore
      }
    }

    setCourseFeedback(`"${assignUserModal.first_name}"-কে "${targetCourse.title}" কোর্সে যুক্ত করা হয়েছে!`);
    setAssignUserModal(null);
    setTimeout(() => setCourseFeedback(''), 5000);
  };

  // ============================================================================
  // FOUNDERS CONTROL CENTER HANDLERS
  // ============================================================================
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFounderFormError('');

    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file, 640, 0.85);
      setFounderForm((prev) => ({ ...prev, photo: compressedDataUrl }));
    } catch {
      setFounderFormError('Could not process the selected image file. Please try another photo.');
    }
  };

  const resetFounderForm = () => {
    setEditingFounderId(null);
    setFounderFormError('');
    setFounderForm({
      name: '',
      role: '',
      specialty: '',
      shortBio: '',
      photo: '',
      backdropColor: '#ff7722',
      rotationClass: '-rotate-3 md:-rotate-4',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startEditFounder = (founder: FounderProfile) => {
    setEditingFounderId(founder.id);
    setFounderFormError('');
    setFounderFeedback('');
    setFounderForm({
      name: founder.name,
      role: founder.role,
      specialty: founder.specialty,
      shortBio: founder.shortBio,
      photo: founder.photo,
      backdropColor: founder.backdropColor || '#ff7722',
      rotationClass: founder.rotationClass || '-rotate-3 md:-rotate-4',
    });
    founderEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSaveFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingFounder) return;

    setFounderFormError('');
    setFounderFeedback('');

    if (!founderForm.name.trim()) {
      setFounderFormError('Founder name is required.');
      return;
    }
    if (!founderForm.role.trim()) {
      setFounderFormError('Founder role / title is required.');
      return;
    }
    if (!founderForm.photo.trim()) {
      setFounderFormError('Please upload a profile picture or provide an image URL.');
      return;
    }

    setIsSavingFounder(true);

    if (editingFounderId) {
      await updateExistingFounder(editingFounderId, founderForm);
      const updated = await fetchFoundersList();
      setFounders(updated);
      setFounderFeedback(`Updated founder "${founderForm.name.trim()}".`);
    } else {
      await createFounder(founderForm);
      const updated = await fetchFoundersList();
      setFounders(updated);
      setFounderFeedback(`Added new founder "${founderForm.name.trim()}".`);
    }

    setIsSavingFounder(false);
    resetFounderForm();
  };

  const handleDeleteSingleFounder = async (founder: FounderProfile) => {
    await removeFounderById(founder.id);
    const updated = await fetchFoundersList();
    setFounders(updated);
    if (editingFounderId === founder.id) {
      resetFounderForm();
    }
    setFounderFeedback(`Removed "${founder.name}" from founders.`);
  };

  const handleDeleteAllFounders = async () => {
    await removeAllFounders();
    setFounders([]);
    setConfirmDeleteAllFounders(false);
    resetFounderForm();
    setFounderFeedback('All founders have been deleted.');
  };

  const handleRestoreDefaults = async () => {
    const defaults = await restoreDefaultFoundersList();
    setFounders(defaults);
    setConfirmDeleteAllFounders(false);
    setFounderFeedback('Restored the 2 default founders.');
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    saveFounderStoryConfig(storyForm);
    setStorySavedMsg('Founder story copy updated on the homepage.');
    setTimeout(() => setStorySavedMsg(''), 4000);
  };

  if (checkingAuth) {
    return (
      <main id="main-content" className="py-24 text-center">
        <div className="specimen-container">
          <p className="font-display text-[20px] font-bold text-[#171412]">
            {t('অ্যাডমিন সেশন যাচাই করা হচ্ছে...', 'Checking admin session...')}
          </p>
        </div>
      </main>
    );
  }

  // ============================================================================
  // VIEW 1: ADMIN OTP LOGIN SCREEN (/check when unauthenticated)
  // ============================================================================
  if (!adminEmail) {
    return (
      <main id="main-content" className="py-12 md:py-20">
        <div className="specimen-container max-w-xl">
          <div className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-10">
            <div className="flex items-center justify-between gap-2 text-[12px] font-bold text-[#813502] mb-3">
              <span>{t('সংরক্ষিত অ্যাক্সেস · /check', 'Restricted Access · /check')}</span>
              <span className="tabular-nums">
                {t(`ধাপ ${loginStep} / ২`, `Step ${loginStep} of 2`)}
              </span>
            </div>

            <h1 className="font-display text-[34px] sm:text-[44px] font-extrabold text-[#171412] leading-[0.95] tracking-[-0.03em] mb-3">
              {t('অ্যাডমিন কন্ট্রোল সেন্টার', 'Admin Control Center')}
            </h1>

            <p className="text-[15px] text-[#171412]/85 leading-[1.45] mb-6">
              {loginStep === 1
                ? t(
                    'অনুমোদিত অ্যাডমিন ইমেইল দিয়ে লগইন করুন। আপনার সেশন যাচাই করতে ইমেইলে একটি ৬-ডিজিটের ওয়ান-টাইম কোড পাঠানো হবে।',
                    'Sign in with your authorized admin email address. We will send a 6-digit one-time verification code to authenticate your session.'
                  )
                : t(
                    `${maskEmailAddress(emailInput)} ঠিকানায় পাঠানো ৬-ডিজিটের ভেরিফিকেশন কোডটি লিখুন।`,
                    `Enter the 6-digit verification code sent to ${maskEmailAddress(
                      emailInput
                    )}.`
                  )}
            </p>

            {!isSupabaseConfigured && (
              <div
                role="status"
                className="mb-6 p-3.5 rounded-[10px] bg-[#ffc765]/40 border border-[#171412]/25 text-[13px] text-[#171412]"
              >
                <strong>Preview Mode:</strong>{' '}
                {t(
                  'অনুমোদিত অ্যাডমিন ইমেইল এবং যেকোনো ৬-ডিজিটের কোড (যেমন: 123456) দিয়ে কন্ট্রোল সেন্টার টেস্ট করুন।',
                  'Select an authorized admin email and enter any 6-digit code (e.g. 123456) to test the Admin Control Center.'
                )}
              </div>
            )}

            {authError && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-6 p-4 rounded-[10px] bg-[#fff8f8] border-2 border-[#ff3c34] text-[#ff3c34] text-[13px] font-semibold flex items-start gap-2"
              >
                <AlertCircleSvgIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {authNotice && (
              <div
                role="status"
                aria-live="polite"
                className="mb-6 p-4 rounded-[10px] bg-[#fbf9ef] border-2 border-[#171412] text-[#171412] text-[13px] font-bold flex items-center gap-2"
              >
                <CheckSvgIcon className="w-4 h-4 text-[#813502] shrink-0" />
                <span>{authNotice}</span>
              </div>
            )}

            {loginStep === 1 ? (
              <form onSubmit={handleSendAdminOtp} noValidate className="flex flex-col gap-5">
                <Input
                  id="admin-email"
                  label={t('অ্যাডমিন ইমেইল ঠিকানা', 'Admin email address')}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="bexobuilder@gmail.com"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                />

                {/* Authorized Admin Quick Select */}
                <div className="p-3.5 rounded-[10px] bg-[#fbf9ef] border border-[#171412]/20">
                  <div className="text-[12px] font-bold text-[#813502] mb-2">
                    {t(
                      'অনুমোদিত অ্যাডমিন অ্যাকাউন্টসমূহ (ক্লিক করে সিলেক্ট করুন):',
                      'Authorized Admin Accounts (click to fill):'
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALLOWED_ADMIN_EMAILS.map((allowedEmail) => (
                      <button
                        key={allowedEmail}
                        type="button"
                        onClick={() => {
                          setEmailInput(allowedEmail);
                          if (authError) setAuthError('');
                        }}
                        className={`px-3 py-1.5 rounded-[50px] text-[12px] font-bold border transition-colors cursor-pointer ${
                          emailInput.trim().toLowerCase() === allowedEmail
                            ? 'bg-[#171412] text-[#fbf9ef] border-[#171412]'
                            : 'bg-[#f2f0e7] text-[#171412] border-[#171412]/30 hover:bg-[#ffc765]'
                        }`}
                      >
                        {allowedEmail}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSendingOtp}
                  loadingText={t('কোড পাঠানো হচ্ছে...', 'Sending code...')}
                  className="w-full"
                >
                  <span>
                    {t('৬-ডিজিটের লগইন কোড পাঠান', 'Send 6-digit login code')}
                  </span>
                  <ArrowRightSvgIcon className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAdminOtp} noValidate className="flex flex-col gap-6">
                <OtpInput
                  value={otpInput}
                  onChange={(val) => {
                    setOtpInput(val);
                    if (authError) setAuthError('');
                  }}
                  disabled={isVerifyingOtp}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="submit"
                    variant="orange"
                    size="lg"
                    isLoading={isVerifyingOtp}
                    loadingText={t('যাচাই করা হচ্ছে...', 'Verifying...')}
                  >
                    <span>
                      {t('ভেরিফাই ও ড্যাশবোর্ড খুলুন', 'Verify & Open Dashboard')}
                    </span>
                    <ArrowRightSvgIcon className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={resendCooldown > 0 || isSendingOtp}
                    onClick={handleResendAdminOtp}
                  >
                    {resendCooldown > 0 ? (
                      <span className="tabular-nums">
                        {t(
                          `পুনরায় পাঠান (${resendCooldown}s)`,
                          `Resend in ${resendCooldown}s`
                        )}
                      </span>
                    ) : (
                      <span>{t('পুনরায় কোড পাঠান', 'Resend code')}</span>
                    )}
                  </Button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep(1);
                      setAuthError('');
                      setAuthNotice('');
                    }}
                    className="text-[13px] font-bold text-[#813502] underline underline-offset-4 hover:text-[#171412] cursor-pointer"
                  >
                    {t('অন্য অ্যাডমিন ইমেইল ব্যবহার করুন', 'Use a different email address')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ============================================================================
  // VIEW 2: AUTHENTICATED ADMIN CONTROL CENTER (/check)
  // ============================================================================
  return (
    <main id="main-content" className="py-8 md:py-12">
      <div className="specimen-container">
        {/* Top Admin Workspace Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 hairline-b mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-[#813502] mb-1">
              <span>{t('অ্যাডমিন কন্ট্রোল সেন্টার', 'Admin Control Center')}</span>
              <span aria-hidden="true">·</span>
              <span>
                {t(`লগইনকৃত: ${adminEmail}`, `Signed in as ${adminEmail}`)}
              </span>
            </div>
            <h1 className="font-display text-[32px] sm:text-[44px] font-extrabold text-[#171412] leading-[0.95] tracking-[-0.03em]">
              {t(
                'ওয়েটলিস্ট ও প্রতিষ্ঠাতা ব্যবস্থাপনা',
                'Waitlist & Founders Management'
              )}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={loadDashboardData}>
              {t('তথ্য রিফ্রেশ করুন', 'Refresh Data')}
            </Button>
            <Button
              variant="orange"
              onClick={() => handleExportCsv('all')}
              aria-label={t(
                'সকল ওয়েটলিস্ট তথ্য CSV ফাইলে ডাউনলোড করুন',
                'Download all waitlist data as CSV'
              )}
            >
              <DownloadSvgIcon className="w-4 h-4" />
              <span>
                {t(
                  `সব তথ্য CSV ডাউনলোড (${waitlistRows.length})`,
                  `Export All CSV (${waitlistRows.length})`
                )}
              </span>
            </Button>
            <Button variant="primary" onClick={handleSignOut}>
              {t('লগ আউট', 'Sign out')}
            </Button>
          </div>
        </div>

        {emailStatusFeedback && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-6 p-4 rounded-[12px] border-2 text-[14px] font-bold flex items-center justify-between gap-3 ${
              emailStatusFeedback.type === 'success'
                ? 'bg-[#e8f5e9] border-[#2e7d32] text-[#1b5e20]'
                : 'bg-[#fff8f8] border-[#ff3c34] text-[#ff3c34]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {emailStatusFeedback.type === 'success' ? (
                <CheckSvgIcon className="w-5 h-5 text-[#2e7d32] shrink-0" />
              ) : (
                <AlertCircleSvgIcon className="w-5 h-5 text-[#ff3c34] shrink-0" />
              )}
              <span>{emailStatusFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setEmailStatusFeedback(null)}
              className="text-[12px] underline cursor-pointer"
            >
              {t('বন্ধ করুন', 'Dismiss')}
            </button>
          </div>
        )}

        {csvExportNotice && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 p-4 rounded-[12px] bg-[#ffc765]/45 border-2 border-[#171412] text-[14px] font-bold text-[#171412] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <CheckSvgIcon className="w-5 h-5 text-[#813502] shrink-0" />
              <span>{csvExportNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setCsvExportNotice('')}
              className="text-[12px] underline cursor-pointer"
            >
              {t('বন্ধ করুন', 'Dismiss')}
            </button>
          </div>
        )}

        {/* Segmented Control Center Tabs */}
        <div
          role="tablist"
          aria-label="Admin control center sections"
          className="inline-flex flex-wrap items-center gap-2 p-1.5 rounded-[50px] bg-[#f2f0e7] border border-[#171412]/20 mb-8"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'waitlist'}
            onClick={() => setActiveTab('waitlist')}
            className={`min-h-[42px] px-6 py-2 rounded-[50px] text-[13px] font-bold transition-colors cursor-pointer ${
              activeTab === 'waitlist'
                ? 'bg-[#171412] text-[#fbf9ef]'
                : 'text-[#171412] hover:bg-[#ebe9df]'
            }`}
          >
            {t(
              `ওয়েটলিস্ট ব্যবহারকারী (${waitlistRows.length})`,
              `Waitlist Users (${waitlistRows.length})`
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'founders'}
            onClick={() => setActiveTab('founders')}
            className={`min-h-[42px] px-6 py-2 rounded-[50px] text-[13px] font-bold transition-colors cursor-pointer ${
              activeTab === 'founders'
                ? 'bg-[#171412] text-[#fbf9ef]'
                : 'text-[#171412] hover:bg-[#ebe9df]'
            }`}
          >
            {t(
              `প্রতিষ্ঠাতা কন্ট্রোল সেন্টার (${founders.length})`,
              `Founders Control Center (${founders.length})`
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'content'}
            onClick={() => setActiveTab('content')}
            className={`min-h-[42px] px-6 py-2 rounded-[50px] text-[13px] font-bold transition-colors cursor-pointer ${
              activeTab === 'content'
                ? 'bg-[#171412] text-[#fbf9ef]'
                : 'text-[#171412] hover:bg-[#ebe9df]'
            }`}
          >
            {t('সাইট কন্টেন্ট এডিটর', 'Site Content Editor')}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'courses'}
            onClick={() => setActiveTab('courses')}
            className={`min-h-[42px] px-6 py-2 rounded-[50px] text-[13px] font-bold transition-colors cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-[#171412] text-[#fbf9ef]'
                : 'text-[#171412] hover:bg-[#ebe9df]'
            }`}
          >
            {t(
              `কোর্স ও প্রোমো কোড ব্যবস্থাপনা (${adminCourses.length})`,
              `Courses & Promos (${adminCourses.length})`
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'contact'}
            onClick={() => setActiveTab('contact')}
            className={`min-h-[42px] px-6 py-2 rounded-[50px] text-[13px] font-bold transition-colors cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#171412] text-[#fbf9ef]'
                : 'text-[#171412] hover:bg-[#ebe9df]'
            }`}
          >
            {t('যোগাযোগ ও সাপোর্ট', 'Contact & Support')}
          </button>
        </div>

        {/* =====================================================================
            TAB 1: WAITLIST USERS & FULL APPLICANT INFORMATION
        ===================================================================== */}
        {activeTab === 'waitlist' && (
          <section aria-label="Waitlist users directory">
            {/* Summary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-4 sm:p-5">
                <div className="text-[12px] font-bold text-[#813502]">
                  Total Waitlist
                </div>
                <div className="font-display text-[32px] sm:text-[36px] font-extrabold text-[#171412] tabular-nums mt-1">
                  {metrics.total}
                </div>
              </div>

              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-4 sm:p-5">
                <div className="text-[12px] font-bold text-[#813502]">
                  Pending Cohort
                </div>
                <div className="font-display text-[32px] sm:text-[36px] font-extrabold text-[#171412] tabular-nums mt-1">
                  {metrics.pending}
                </div>
              </div>

              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#2e7d32]/30 p-4 sm:p-5">
                <div className="text-[12px] font-bold text-[#1b5e20] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2e7d32]"></span>
                  Approved
                </div>
                <div className="font-display text-[32px] sm:text-[36px] font-extrabold text-[#1b5e20] tabular-nums mt-1">
                  {metrics.approved}
                </div>
              </div>

              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#b91c1c]/30 p-4 sm:p-5">
                <div className="text-[12px] font-bold text-[#991b1b] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                  Rejected
                </div>
                <div className="font-display text-[32px] sm:text-[36px] font-extrabold text-[#991b1b] tabular-nums mt-1">
                  {metrics.rejected}
                </div>
              </div>

              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-4 sm:p-5">
                <div className="text-[12px] font-bold text-[#813502]">
                  Contacted
                </div>
                <div className="font-display text-[32px] sm:text-[36px] font-extrabold text-[#171412] tabular-nums mt-1">
                  {metrics.contacted}
                </div>
              </div>
            </div>

            {/* Search, Status Filter & CSV Export Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <label htmlFor="waitlist-search" className="sr-only">
                  Search waitlist users by name, email, phone, or WhatsApp
                </label>
                <input
                  id="waitlist-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(
                    'নাম, ইমেইল, ফোন বা হোয়াটসঅ্যাপ দিয়ে খুঁজুন...',
                    'Search name, email, phone, or WhatsApp...'
                  )}
                  className="w-full min-h-[44px] px-4 py-2 rounded-[12px] bg-[#fff] border border-[#171412]/30 text-[15px] text-[#171412] placeholder:text-[#171412]/45"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="course-filter-select" className="text-[12px] font-bold text-[#813502] whitespace-nowrap">
                    {t('কোর্স:', 'Course:')}
                  </label>
                  <select
                    id="course-filter-select"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="min-h-[40px] px-3 py-1.5 rounded-[50px] bg-[#fff] border border-[#171412]/30 text-[12px] font-bold text-[#171412] cursor-pointer"
                  >
                    <option value="all">{t('সকল কোর্স (All)', 'All Courses')}</option>
                    {adminCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                    <option value="none">{t('বাছাই বাকি (Pending)', 'Pending Selection')}</option>
                  </select>
                </div>

                {(['all', 'pending', 'approved', 'rejected', 'contacted'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`min-h-[40px] px-4 py-1.5 rounded-[50px] text-[12px] font-bold capitalize transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#ff7722] text-[#171412] border border-[#171412]'
                        : 'bg-[#f2f0e7] text-[#171412] border border-[#171412]/15 hover:bg-[#ebe9df]'
                    }`}
                  >
                    {st === 'approved' ? '✓ Approved' : st === 'rejected' ? '✕ Rejected' : st}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleExportCsv('all')}
                  className="min-h-[40px] px-4 py-1.5 rounded-[50px] bg-[#171412] text-[#fbf9ef] hover:bg-[#2c2623] text-[12px] font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <DownloadSvgIcon className="w-3.5 h-3.5" />
                  <span>
                    {t(
                      `CSV ডাউনলোড (${waitlistRows.length})`,
                      `Download CSV (${waitlistRows.length})`
                    )}
                  </span>
                </button>

                {(statusFilter !== 'all' || courseFilter !== 'all' || searchQuery.trim() !== '') && (
                  <button
                    type="button"
                    onClick={() => handleExportCsv('filtered')}
                    className="min-h-[40px] px-4 py-1.5 rounded-[50px] bg-[#ffc765] text-[#171412] border border-[#171412] text-[12px] font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <DownloadSvgIcon className="w-3.5 h-3.5" />
                    <span>
                      {t(
                        `ফিল্টারকৃত CSV (${filteredWaitlist.length})`,
                        `Export Filtered (${filteredWaitlist.length})`
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {waitlistError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-[12px] bg-[#fff8f8] border border-[#ff3c34] text-[13px] text-[#ff3c34] font-semibold"
              >
                Supabase query note: {waitlistError}. Make sure you have run the latest
                SQL in <code className="font-mono">supabase/schema.sql</code>.
              </div>
            )}

            {/* Waitlist Table / Cards */}
            {loadingWaitlist ? (
              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-12 text-center font-display text-[18px] font-bold">
                Loading waitlist applicants...
              </div>
            ) : filteredWaitlist.length === 0 ? (
              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-12 text-center">
                <h2 className="specimen-h3 mb-2">No waitlist users found</h2>
                <p className="text-[15px] text-[#171412]/75 max-w-md mx-auto">
                  {waitlistRows.length === 0
                    ? 'As soon as visitors verify their 6-digit OTP on /join, all of their details will appear here automatically.'
                    : 'No applicants match your current search, course, or status filter.'}
                </p>
              </div>
            ) : (
              <div className="rounded-[12px] bg-[#fff] border-2 border-[#171412] overflow-hidden max-w-full">
                <div className="overflow-x-auto w-full -webkit-overflow-scrolling-touch">
                  <table id="content-table" className="w-full text-left border-collapse min-w-[840px]">
                    <thead>
                      <tr className="bg-[#171412] text-[#fbf9ef] text-[11px] sm:text-[12px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-3 whitespace-nowrap">#</th>
                        <th className="py-3 px-3 whitespace-nowrap">Full Name</th>
                        <th className="py-3 px-3 whitespace-nowrap">Enrolled Course & Fee</th>
                        <th className="py-3 px-3 whitespace-nowrap">Email Address</th>
                        <th className="py-3 px-3 whitespace-nowrap">Phone Number</th>
                        <th className="py-3 px-3 whitespace-nowrap">WhatsApp</th>
                        <th className="py-3 px-3 whitespace-nowrap">DOB & Age</th>
                        <th className="py-3 px-3 whitespace-nowrap">Consent</th>
                        <th className="py-3 px-3 whitespace-nowrap">Joined At</th>
                        <th className="py-3 px-3 whitespace-nowrap">Status</th>
                        <th className="py-3 px-3 whitespace-nowrap text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#171412]/12 text-[13px] sm:text-[14px]">
                      {filteredWaitlist.map((user, idx) => {
                        const age = calculateAge(user.date_of_birth);
                        const waClean = user.whatsapp.replace(/\D/g, '');
                        const isConfirmingDelete = confirmDeleteUserId === user.id;

                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-[#fbf9ef] transition-colors align-top"
                          >
                            <td className="py-3.5 px-3 font-bold text-[#813502] tabular-nums">
                              {String(idx + 1).padStart(2, '0')}
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="font-display text-[14px] sm:text-[15px] font-extrabold text-[#171412] whitespace-nowrap">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-[10px] text-[#171412]/60 font-mono mt-0.5">
                                ID: {user.id.slice(0, 8)}
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              {user.course_title ? (
                                <div className="max-w-[210px]">
                                  <div className="font-bold text-[#171412] text-[13px] leading-snug">
                                    {user.course_title}
                                  </div>
                                  <div className="text-[12px] text-[#813502] font-semibold flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="tabular-nums">
                                      ৳{user.final_fee !== undefined ? user.final_fee.toLocaleString() : (user.course_fee || 1000)}
                                    </span>
                                    {user.promo_code && (
                                      <span className="text-[10px] font-mono bg-[#e8f5e9] text-[#1b5e20] px-1.5 py-0.2 rounded border border-[#2e7d32]/30 font-bold">
                                        {user.promo_code}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[12px] text-[#171412]/50 italic">
                                  {t('বাছাই বাকি', 'Pending selection')}
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-3">
                              <a
                                href={`mailto:${user.email}`}
                                className="font-semibold text-[#171412] underline underline-offset-2 hover:text-[#813502] break-all"
                              >
                                {user.email}
                              </a>
                            </td>

                            <td className="py-3.5 px-3 tabular-nums whitespace-nowrap">
                              <a
                                href={`tel:${user.phone}`}
                                className="hover:underline text-[#171412]"
                              >
                                {user.phone}
                              </a>
                            </td>

                            <td className="py-3.5 px-3 tabular-nums whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-[#171412]">
                                  {user.whatsapp}
                                </span>
                                {waClean && (
                                  <a
                                    href={`https://wa.me/${waClean}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-bold text-[#813502] underline underline-offset-2 hover:text-[#171412]"
                                  >
                                    WhatsApp
                                  </a>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-3 tabular-nums whitespace-nowrap">
                              <div className="font-medium text-[#171412]">
                                {user.date_of_birth}
                              </div>
                              {age !== null && (
                                <div className="text-[11px] text-[#813502] font-bold">
                                  {age} yrs
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="text-[12px] font-bold text-[#171412]">
                                {user.consent_accepted ? 'Yes' : 'No'}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 tabular-nums text-[12px] text-[#171412]/85 whitespace-nowrap">
                              {formatDateTime(user.created_at)}
                            </td>

                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="flex flex-col gap-1.5">
                                {user.status === 'approved' && (
                                  <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-[50px] text-[11px] font-bold bg-[#e8f5e9] text-[#1b5e20] border border-[#2e7d32]/40">
                                    ✓ Approved
                                  </span>
                                )}
                                {user.status === 'rejected' && (
                                  <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-[50px] text-[11px] font-bold bg-[#fef2f2] text-[#991b1b] border border-[#ef4444]/40">
                                    ✕ Rejected
                                  </span>
                                )}
                                {user.status === 'pending' && (
                                  <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-[50px] text-[11px] font-bold bg-[#fff9e6] text-[#813502] border border-[#ff7722]/40">
                                    ⏳ Pending
                                  </span>
                                )}
                                {user.status === 'contacted' && (
                                  <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-[50px] text-[11px] font-bold bg-[#eff6ff] text-[#1e40af] border border-[#3b82f6]/40">
                                    💬 Contacted
                                  </span>
                                )}

                                <select
                                  aria-label={`Status for ${user.first_name} ${user.last_name}`}
                                  value={user.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      user.id,
                                      e.target.value as
                                        | 'pending'
                                        | 'approved'
                                        | 'rejected'
                                        | 'contacted'
                                    )
                                  }
                                  className="min-h-[30px] px-2 py-0.5 rounded-[6px] bg-[#f2f0e7] border border-[#171412]/30 text-[11px] font-bold text-[#171412] cursor-pointer"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approve & Email</option>
                                  <option value="rejected">Reject & Email</option>
                                  <option value="contacted">Contacted</option>
                                </select>
                              </div>
                            </td>

                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {user.status !== 'approved' && (
                                  <button
                                    type="button"
                                    onClick={() => openEmailModal(user, 'approved')}
                                    title="অনুমোদন করুন ও বাংলা ইমেইল পাঠান"
                                    className="min-h-[30px] px-2.5 py-1 rounded-[6px] bg-[#2e7d32] hover:bg-[#1b5e20] text-[#fff] text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}

                                {user.status !== 'rejected' && (
                                  <button
                                    type="button"
                                    onClick={() => openEmailModal(user, 'rejected')}
                                    title="প্রত্যাখ্যান করুন ও বাংলা ইমেইল পাঠান"
                                    className="min-h-[30px] px-2.5 py-1 rounded-[6px] bg-[#f2f0e7] hover:bg-[#fee2e2] text-[#991b1b] border border-[#ef4444]/40 text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                )}

                                {(user.status === 'approved' || user.status === 'rejected') && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEmailModal(
                                        user,
                                        user.status === 'rejected' ? 'rejected' : 'approved'
                                      )
                                    }
                                    title="কাস্টম বার্তা সহ পুনরায় বাংলা ইমেইল পাঠান"
                                    className="min-h-[30px] px-2.5 py-1 rounded-[6px] bg-[#ffc765] hover:bg-[#ffb732] text-[#171412] border border-[#171412]/40 text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    📧 Email
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssignUserModal(user);
                                    setAssignCourseId(user.course_id || adminCourses[0]?.id || '');
                                  }}
                                  title="কোর্স নির্ধারণ বা পরিবর্তন করুন"
                                  className="min-h-[30px] px-2.5 py-1 rounded-[6px] bg-[#f2f0e7] hover:bg-[#ffc765]/50 text-[#813502] border border-[#171412]/30 text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  🎓 {t('কোর্স', 'Course')}
                                </button>

                                {!isConfirmingDelete ? (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteUserId(user.id)}
                                    className="min-h-[30px] px-2 py-1 rounded-[6px] text-[11px] font-bold text-[#ff3c34] hover:bg-[#fff0f0] cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                ) : (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="min-h-[28px] px-2 py-0.5 rounded-[4px] bg-[#ff3c34] text-[#fff] text-[10px] font-bold cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteUserId(null)}
                                      className="min-h-[28px] px-2 py-0.5 rounded-[4px] bg-[#f2f0e7] text-[#171412] text-[10px] font-bold cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            TAB 2: FOUNDERS CONTROL CENTER (Add, Edit, Delete, Delete All, Upload Photo)
        ===================================================================== */}
        {activeTab === 'founders' && (
          <section aria-label="Founders control center" className="flex flex-col gap-12">
            {/* Top Bar for Founders List + Delete All / Restore */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412]">
              <div>
                <h2 className="specimen-h3 text-[#171412]">
                  Active Homepage Founders ({founders.length})
                </h2>
                <p className="text-[14px] text-[#171412]/80 mt-1">
                  Manage founder profile pictures, roles, bios, or delete all founders
                  and add new ones.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={handleRestoreDefaults}>
                  Restore Default Founders
                </Button>

                {founders.length > 0 && !confirmDeleteAllFounders && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAllFounders(true)}
                    className="min-h-[44px] px-5 py-2.5 rounded-[50px] bg-[#ff3c34] text-[#fff] text-[13px] font-bold cursor-pointer"
                  >
                    Delete All Founders
                  </button>
                )}

                {confirmDeleteAllFounders && (
                  <div className="flex items-center gap-2 p-1.5 rounded-[50px] bg-[#fff8f8] border-2 border-[#ff3c34]">
                    <button
                      type="button"
                      onClick={handleDeleteAllFounders}
                      className="min-h-[38px] px-4 py-1.5 rounded-[50px] bg-[#ff3c34] text-[#fff] text-[12px] font-bold cursor-pointer"
                    >
                      Confirm Delete All
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAllFounders(false)}
                      className="min-h-[38px] px-4 py-1.5 rounded-[50px] bg-[#f2f0e7] text-[#171412] text-[12px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {founderFeedback && (
              <div
                role="status"
                aria-live="polite"
                className="p-4 rounded-[12px] bg-[#ffc765]/40 border-2 border-[#171412] text-[14px] font-bold text-[#171412] flex items-center justify-between"
              >
                <span>{founderFeedback}</span>
                <button
                  type="button"
                  onClick={() => setFounderFeedback('')}
                  className="text-[12px] underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Current Founders Cards Grid */}
            {founders.length === 0 ? (
              <div className="rounded-[12px] bg-[#fff] border-2 border-dashed border-[#171412]/40 p-10 text-center">
                <h3 className="specimen-h3 mb-2">All founders have been deleted</h3>
                <p className="text-[15px] text-[#171412]/75 max-w-md mx-auto">
                  The homepage founders photo row is currently empty. Use the form below
                  to add a new founder with their profile picture, or click &ldquo;Restore
                  Default Founders&rdquo; above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {founders.map((founder) => (
                  <article
                    key={founder.id}
                    className="rounded-[12px] bg-[#fff] border-2 border-[#171412] p-5 flex flex-col justify-between gap-5"
                  >
                    <div>
                      <div
                        style={{ backgroundColor: founder.backdropColor }}
                        className="w-full p-2.5 rounded-[10px] border-2 border-[#171412] mb-4"
                      >
                        <div className="aspect-[3/4] w-full rounded-[6px] overflow-hidden bg-[#171412]">
                          <img
                            src={founder.photo}
                            alt={founder.alt}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      </div>

                      <div className="text-[12px] font-bold text-[#813502]">
                        {founder.specialty}
                      </div>
                      <h3 className="font-display text-[22px] font-extrabold text-[#171412] mt-0.5">
                        {founder.name}
                      </h3>
                      <div className="text-[13px] font-bold text-[#171412]/75 mb-3">
                        {founder.role}
                      </div>
                      <p className="text-[14px] text-[#171412]/90 leading-[1.4]">
                        {founder.shortBio}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#171412]/12 flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        onClick={() => startEditFounder(founder)}
                      >
                        Edit Founder
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleFounder(founder)}
                        className="min-h-[44px] px-4 py-2 rounded-[50px] text-[13px] font-bold text-[#ff3c34] hover:bg-[#fff0f0] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Add / Edit Founder Form */}
            <div
              ref={founderEditorRef}
              className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-10"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <div className="text-[12px] font-bold text-[#813502]">
                    {editingFounderId ? 'Editing Existing Founder' : 'Create Founder Profile'}
                  </div>
                  <h2 className="font-display text-[28px] sm:text-[36px] font-extrabold text-[#171412] leading-tight">
                    {editingFounderId ? 'Update Founder Details' : 'Add a New Founder'}
                  </h2>
                </div>

                {editingFounderId && (
                  <Button variant="outline" onClick={resetFounderForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>

              {founderFormError && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-[10px] bg-[#fff8f8] border-2 border-[#ff3c34] text-[#ff3c34] text-[13px] font-semibold flex items-center gap-2"
                >
                  <AlertCircleSvgIcon className="w-4 h-4 shrink-0" />
                  <span>{founderFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveFounder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 7 Cols: Text Fields */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="founder-name"
                      label="Founder full name"
                      required
                      placeholder="e.g. Arafat Rahman"
                      value={founderForm.name}
                      onChange={(e) =>
                        setFounderForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />

                    <Input
                      id="founder-role"
                      label="Role / Title chip"
                      required
                      placeholder="e.g. Co-Founder · Product Strategy"
                      value={founderForm.role}
                      onChange={(e) =>
                        setFounderForm((prev) => ({ ...prev, role: e.target.value }))
                      }
                    />
                  </div>

                  <Input
                    id="founder-specialty"
                    label="Specialty kicker"
                    placeholder="e.g. Product Validation & Direct Agent Sourcing"
                    value={founderForm.specialty}
                    onChange={(e) =>
                      setFounderForm((prev) => ({ ...prev, specialty: e.target.value }))
                    }
                  />

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="founder-bio"
                      className="text-[14px] font-bold text-[#171412]"
                    >
                      Short biography
                    </label>
                    <textarea
                      id="founder-bio"
                      rows={4}
                      placeholder="Write a short 2–3 sentence bio about the founder's background..."
                      value={founderForm.shortBio}
                      onChange={(e) =>
                        setFounderForm((prev) => ({ ...prev, shortBio: e.target.value }))
                      }
                      className="w-full p-3.5 rounded-[12px] bg-[#fff] border border-[#171412]/25 text-[15px] text-[#171412]"
                    />
                  </div>

                  {/* Frame Color & Tilt Angle Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="founder-color"
                        className="text-[14px] font-bold text-[#171412]"
                      >
                        Frame backdrop color
                      </label>
                      <select
                        id="founder-color"
                        value={founderForm.backdropColor}
                        onChange={(e) =>
                          setFounderForm((prev) => ({
                            ...prev,
                            backdropColor: e.target.value,
                          }))
                        }
                        className="min-h-[46px] px-3.5 py-2 rounded-[12px] bg-[#fff] border border-[#171412]/25 text-[15px] font-bold text-[#171412] cursor-pointer"
                      >
                        {BACKDROP_COLORS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label} ({c.value})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="founder-tilt"
                        className="text-[14px] font-bold text-[#171412]"
                      >
                        Card frame tilt angle
                      </label>
                      <select
                        id="founder-tilt"
                        value={founderForm.rotationClass}
                        onChange={(e) =>
                          setFounderForm((prev) => ({
                            ...prev,
                            rotationClass: e.target.value,
                          }))
                        }
                        className="min-h-[46px] px-3.5 py-2 rounded-[12px] bg-[#fff] border border-[#171412]/25 text-[15px] font-bold text-[#171412] cursor-pointer"
                      >
                        {ROTATION_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Profile Picture Upload & Live Preview */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="text-[14px] font-bold text-[#171412]">
                    Founder profile picture *
                  </div>

                  {/* Upload from Device */}
                  <div className="p-4 rounded-[12px] bg-[#fff] border border-[#171412]/25 flex flex-col gap-3">
                    <label
                      htmlFor="founder-photo-file"
                      className="text-[13px] font-bold text-[#813502]"
                    >
                      Option 1: Upload photo from your device
                    </label>
                    <input
                      ref={fileInputRef}
                      id="founder-photo-file"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-[13px] text-[#171412] file:mr-3 file:py-2 file:px-4 file:rounded-[50px] file:border-0 file:text-[12px] file:font-bold file:bg-[#171412] file:text-[#fbf9ef] hover:file:bg-[#2c2623] cursor-pointer"
                    />

                    <div className="pt-2 border-t border-[#171412]/10">
                      <label
                        htmlFor="founder-photo-url"
                        className="block text-[12px] font-bold text-[#171412]/75 mb-1"
                      >
                        Option 2: Or paste image URL / path
                      </label>
                      <input
                        id="founder-photo-url"
                        type="text"
                        placeholder="https://... or data:image/..."
                        value={
                          founderForm.photo.startsWith('data:')
                            ? ''
                            : founderForm.photo
                        }
                        onChange={(e) =>
                          setFounderForm((prev) => ({
                            ...prev,
                            photo: e.target.value,
                          }))
                        }
                        className="w-full min-h-[38px] px-3 py-1.5 rounded-[8px] bg-[#fbf9ef] border border-[#171412]/20 text-[13px]"
                      />
                    </div>
                  </div>

                  {/* Live Card Frame Preview */}
                  <div className="flex flex-col items-center pt-2">
                    <div
                      style={{ backgroundColor: founderForm.backdropColor }}
                      className="w-48 p-2.5 rounded-[12px] border-2 border-[#171412]"
                    >
                      <div className="aspect-[3/4] w-full rounded-[8px] overflow-hidden bg-[#171412] flex items-center justify-center">
                        {founderForm.photo ? (
                          <img
                            src={founderForm.photo}
                            alt="Founder preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <span className="text-[12px] text-[#fbf9ef]/70 px-4 text-center">
                            Upload a photo to preview
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-12 pt-2 border-t border-[#171412]/15 flex items-center gap-4">
                  <Button
                    type="submit"
                    variant="orange"
                    size="lg"
                    isLoading={isSavingFounder}
                    loadingText="Saving founder..."
                  >
                    {editingFounderId ? 'Save Founder Changes' : 'Add Founder to Website'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Founder Section Story Headline & Copy Editor */}
            <div className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-10">
              <div className="text-[12px] font-bold text-[#813502] mb-1">
                Homepage Section Copy
              </div>
              <h2 className="font-display text-[26px] sm:text-[32px] font-extrabold text-[#171412] mb-6">
                Edit &ldquo;Small team, big results&rdquo; Story
              </h2>

              <form onSubmit={handleSaveStory} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="story-headline"
                    label="Giant section headline"
                    value={storyForm.headline}
                    onChange={(e) =>
                      setStoryForm((prev) => ({ ...prev, headline: e.target.value }))
                    }
                  />
                  <Input
                    id="story-cta"
                    label="Bio drawer button label"
                    value={storyForm.ctaLabel}
                    onChange={(e) =>
                      setStoryForm((prev) => ({ ...prev, ctaLabel: e.target.value }))
                    }
                  />
                </div>

                <Input
                  id="story-lead"
                  label="Lead statement"
                  value={storyForm.lead}
                  onChange={(e) =>
                    setStoryForm((prev) => ({ ...prev, lead: e.target.value }))
                  }
                />

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="story-body"
                    className="text-[14px] font-bold text-[#171412]"
                  >
                    Story paragraph
                  </label>
                  <textarea
                    id="story-body"
                    rows={4}
                    value={storyForm.body}
                    onChange={(e) =>
                      setStoryForm((prev) => ({ ...prev, body: e.target.value }))
                    }
                    className="w-full p-3.5 rounded-[12px] bg-[#fff] border border-[#171412]/25 text-[15px] text-[#171412]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Button type="submit" variant="primary">
                    Save Story Copy
                  </Button>
                  {storySavedMsg && (
                    <span
                      role="status"
                      className="text-[13px] font-bold text-[#813502]"
                    >
                      {storySavedMsg}
                    </span>
                  )}
                </div>
              </form>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 3: SITE CONTENT EDITOR (Bento, Curriculum, Testimonials, FAQs)
        ===================================================================== */}
        {activeTab === 'content' && (
          <section aria-label="Site content editor" className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412]">
              <div>
                <h2 className="specimen-h3 text-[#171412]">
                  {t('ওয়েবসাইট কন্টেন্ট এডিটর', 'Website Content Editor')}
                </h2>
                <p className="text-[14px] text-[#171412]/80 mt-1">
                  {t(
                    'বেন্টো ফিচার, কারিকুলাম, মতামত ও সাধারণ জিজ্ঞাসা পরিবর্তন করুন। সমস্ত ডিভাইসে তাৎক্ষণিকভাবে সিঙ্ক হবে।',
                    'Edit bento features, curriculum modules, testimonials, and FAQs. Changes sync instantly across all user devices.'
                  )}
                </p>
              </div>

              {/* Language Switcher for Content Editor */}
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#171412]">Language:</span>
                <button
                  type="button"
                  onClick={() => setContentLang('bn')}
                  className={`px-4 py-2 rounded-[50px] text-[13px] font-bold border transition-colors cursor-pointer ${
                    contentLang === 'bn'
                      ? 'bg-[#171412] text-[#fbf9ef] border-[#171412]'
                      : 'bg-[#fff] text-[#171412] border-[#171412]/30 hover:bg-[#ffc765]'
                  }`}
                >
                  বাংলা (BN)
                </button>
                <button
                  type="button"
                  onClick={() => setContentLang('en')}
                  className={`px-4 py-2 rounded-[50px] text-[13px] font-bold border transition-colors cursor-pointer ${
                    contentLang === 'en'
                      ? 'bg-[#171412] text-[#fbf9ef] border-[#171412]'
                      : 'bg-[#fff] text-[#171412] border-[#171412]/30 hover:bg-[#ffc765]'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            {siteContentNotice && (
              <div
                role="status"
                aria-live="polite"
                className="p-4 rounded-[12px] bg-[#ffc765]/40 border-2 border-[#171412] text-[14px] font-bold text-[#171412] flex items-center justify-between"
              >
                <span>{siteContentNotice}</span>
                <button
                  type="button"
                  onClick={() => setSiteContentNotice('')}
                  className="text-[12px] underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Content Section Sub-tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#171412]/15 pb-4">
              {(
                [
                  { id: 'slider', labelBn: 'হিরো স্লাইডার', labelEn: 'Hero Slider' },
                  { id: 'why-choose', labelBn: 'কেন বেছে নেবেন', labelEn: 'Why Choose Us' },
                  { id: 'bento', labelBn: 'নির্বাচিত ফলাফল (বেন্টো)', labelEn: 'Featured Results' },
                  { id: 'curriculum', labelBn: 'কারিকুলাম মডিউল', labelEn: 'Curriculum' },
                  { id: 'testimonials', labelBn: 'ছাত্র মতামত', labelEn: 'Testimonials' },
                  { id: 'faq', labelBn: 'সাধারণ জিজ্ঞাসা', labelEn: 'FAQs' },
                ] as const
              ).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setContentSubTab(sub.id as any)}
                  className={`min-h-[40px] px-5 py-2 rounded-[50px] text-[13px] font-bold transition-colors cursor-pointer ${
                    contentSubTab === sub.id
                      ? 'bg-[#ff7722] text-[#171412] border border-[#171412]'
                      : 'bg-[#f2f0e7] text-[#171412] border border-[#171412]/20 hover:bg-[#ebe9df]'
                  }`}
                >
                  {t(sub.labelBn, sub.labelEn)}
                </button>
              ))}
            </div>

            {/* 0. Hero Slider Editor */}
            {contentSubTab === 'slider' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-[22px] font-extrabold text-[#171412]">
                      হিরো স্লাইডার ব্যবস্থাপনা ({contentLang.toUpperCase()})
                    </h3>
                    <p className="text-[13px] text-[#813502] font-semibold mt-0.5">
                      ওয়েবসাইটে ঢোকার সাথে সাথে দৃশ্যমান স্লাইডার কন্টেন্ট ও ছবি এডিট করুন
                    </p>
                  </div>
                  <Button
                    variant="orange"
                    isLoading={isSavingSection}
                    loadingText="Saving..."
                    onClick={() => handleSaveSectionData(`hero_slides_${contentLang}`, adminHeroSlides)}
                  >
                    Save & Sync Hero Slides
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {adminHeroSlides.map((slide, index) => (
                    <div
                      key={slide.id || `slide-${index}`}
                      className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6 flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between text-[12px] font-bold text-[#813502]">
                        <span>Slide #{index + 1} ({slide.id})</span>
                        <div className="flex items-center gap-2">
                          <img
                            src={slide.image}
                            alt=""
                            className="w-10 h-8 object-cover rounded border border-[#171412]/30"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/hero_laptop_business_1791567717121.jpg';
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          id={`slide-badge-${index}`}
                          label="Badge / Kicker"
                          value={slide.badge}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminHeroSlides((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, badge: val } : s))
                            );
                          }}
                        />
                        <Input
                          id={`slide-prefix-${index}`}
                          label="Title Prefix"
                          value={slide.titlePrefix}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminHeroSlides((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, titlePrefix: val } : s))
                            );
                          }}
                        />
                        <Input
                          id={`slide-highlight-${index}`}
                          label="Title Highlight (Orange)"
                          value={slide.titleHighlight}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminHeroSlides((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, titleHighlight: val } : s))
                            );
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-bold text-[#171412]">Subtitle / Description</label>
                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminHeroSlides((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, subtitle: val } : s))
                            );
                          }}
                          className="w-full p-3 rounded-[10px] bg-[#fff] border border-[#171412]/25 text-[14px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          id={`slide-image-${index}`}
                          label="Image URL or Asset Path"
                          value={slide.image}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminHeroSlides((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, image: val } : s))
                            );
                          }}
                        />
                        <Input
                          id={`slide-cta-${index}`}
                          label="CTA Button Label"
                          value={slide.ctaText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminHeroSlides((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, ctaText: val } : s))
                            );
                          }}
                        />
                        <Input
                          id={`slide-script-${index}`}
                          label="Script Overlay Text"
                          value={slide.floatingScriptText || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminHeroSlides((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, floatingScriptText: val } : s))
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 0.5. Why Choose Us Editor */}
            {contentSubTab === 'why-choose' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-[22px] font-extrabold text-[#171412]">
                      কেন বেছে নেবেন (৫টি মূল স্তম্ভ) ({contentLang.toUpperCase()})
                    </h3>
                    <p className="text-[13px] text-[#813502] font-semibold mt-0.5">
                      হিরো স্লাইডারের নিচে প্রদর্শিত ৫টি ফিচার কার্ড পরিচালনা করুন
                    </p>
                  </div>
                  <Button
                    variant="orange"
                    isLoading={isSavingSection}
                    loadingText="Saving..."
                    onClick={() => handleSaveSectionData(`why_choose_us_${contentLang}`, adminWhyChoose)}
                  >
                    Save & Sync Why Choose Us
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {adminWhyChoose.map((item, index) => (
                    <div
                      key={item.id || `why-${index}`}
                      className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6 flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between text-[12px] font-bold text-[#813502]">
                        <span>Pillar #{index + 1} ({item.id})</span>
                        <span>Icon: {item.iconType}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          id={`why-title-${index}`}
                          label="Pillar Title"
                          value={item.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminWhyChoose((prev) =>
                              prev.map((w, i) => (i === index ? { ...w, title: val } : w))
                            );
                          }}
                        />
                        <Input
                          id={`why-desc-${index}`}
                          label="Description"
                          value={item.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminWhyChoose((prev) =>
                              prev.map((w, i) => (i === index ? { ...w, description: val } : w))
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Bento Features Editor */}
            {contentSubTab === 'bento' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[22px] font-extrabold text-[#171412]">
                    Editing Bento Grid Features ({contentLang.toUpperCase()})
                  </h3>
                  <Button
                    variant="orange"
                    isLoading={isSavingSection}
                    loadingText="Saving..."
                    onClick={() => handleSaveSectionData(`featured_results_${contentLang}`, adminBento)}
                  >
                    Save & Sync Bento Features
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {adminBento.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6 flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between text-[12px] font-bold text-[#813502]">
                        <span>Card #{index + 1} ({item.id})</span>
                        <span>Type: {item.type}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          id={`bento-tag-${index}`}
                          label="Tag / Kicker"
                          value={item.tag}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminBento((prev) =>
                              prev.map((b, i) => (i === index ? { ...b, tag: val } : b))
                            );
                          }}
                        />
                        <Input
                          id={`bento-metric-${index}`}
                          label="Metric / Stat Badge"
                          value={item.metric}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminBento((prev) =>
                              prev.map((b, i) => (i === index ? { ...b, metric: val } : b))
                            );
                          }}
                        />
                      </div>
                      <Input
                        id={`bento-title-${index}`}
                        label="Card Title"
                        value={item.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminBento((prev) =>
                            prev.map((b, i) => (i === index ? { ...b, title: val } : b))
                          );
                        }}
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-bold text-[#171412]">Subcopy / Description</label>
                        <textarea
                          rows={2}
                          value={item.subcopy}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminBento((prev) =>
                              prev.map((b, i) => (i === index ? { ...b, subcopy: val } : b))
                            );
                          }}
                          className="w-full p-3 rounded-[10px] bg-[#fff] border border-[#171412]/25 text-[14px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Curriculum Editor */}
            {contentSubTab === 'curriculum' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[22px] font-extrabold text-[#171412]">
                    Editing Curriculum Modules ({contentLang.toUpperCase()})
                  </h3>
                  <Button
                    variant="orange"
                    isLoading={isSavingSection}
                    loadingText="Saving..."
                    onClick={() => handleSaveSectionData(`curriculum_tabs_${contentLang}`, adminCurriculum)}
                  >
                    Save & Sync Curriculum
                  </Button>
                </div>

                <div className="flex flex-col gap-6">
                  {adminCurriculum.map((tab, index) => (
                    <div
                      key={tab.id}
                      className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6 flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between text-[12px] font-bold text-[#813502]">
                        <span>Module Step {tab.stepNumber} ({tab.id})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          id={`curr-label-${index}`}
                          label="Tab Label"
                          value={tab.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminCurriculum((prev) =>
                              prev.map((c, i) => (i === index ? { ...c, label: val } : c))
                            );
                          }}
                        />
                        <Input
                          id={`curr-headline-${index}`}
                          label="Module Headline"
                          value={tab.headline}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminCurriculum((prev) =>
                              prev.map((c, i) => (i === index ? { ...c, headline: val } : c))
                            );
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-bold text-[#171412]">Module Description</label>
                        <textarea
                          rows={3}
                          value={tab.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminCurriculum((prev) =>
                              prev.map((c, i) => (i === index ? { ...c, description: val } : c))
                            );
                          }}
                          className="w-full p-3 rounded-[10px] bg-[#fff] border border-[#171412]/25 text-[14px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Testimonials Editor */}
            {contentSubTab === 'testimonials' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[22px] font-extrabold text-[#171412]">
                    Editing Student Testimonials ({contentLang.toUpperCase()})
                  </h3>
                  <Button
                    variant="orange"
                    isLoading={isSavingSection}
                    loadingText="Saving..."
                    onClick={() => handleSaveSectionData(`testimonials_${contentLang}`, adminTestimonials)}
                  >
                    Save & Sync Testimonials
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {adminTestimonials.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6 flex flex-col gap-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          id={`test-author-${index}`}
                          label="Author Name"
                          value={item.author}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminTestimonials((prev) =>
                              prev.map((t, i) => (i === index ? { ...t, author: val } : t))
                            );
                          }}
                        />
                        <Input
                          id={`test-role-${index}`}
                          label="Author Role"
                          value={item.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminTestimonials((prev) =>
                              prev.map((t, i) => (i === index ? { ...t, role: val } : t))
                            );
                          }}
                        />
                        <Input
                          id={`test-tag-${index}`}
                          label="Tag Badge"
                          value={item.tag}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminTestimonials((prev) =>
                              prev.map((t, i) => (i === index ? { ...t, tag: val } : t))
                            );
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-bold text-[#171412]">Testimonial Quote</label>
                        <textarea
                          rows={3}
                          value={item.quote}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminTestimonials((prev) =>
                              prev.map((t, i) => (i === index ? { ...t, quote: val } : t))
                            );
                          }}
                          className="w-full p-3 rounded-[10px] bg-[#fff] border border-[#171412]/25 text-[14px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FAQs Editor */}
            {contentSubTab === 'faq' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[22px] font-extrabold text-[#171412]">
                    Editing Frequently Asked Questions ({contentLang.toUpperCase()})
                  </h3>
                  <Button
                    variant="orange"
                    isLoading={isSavingSection}
                    loadingText="Saving..."
                    onClick={() => handleSaveSectionData(`faq_items_${contentLang}`, adminFaqs)}
                  >
                    Save & Sync FAQs
                  </Button>
                </div>

                <div className="flex flex-col gap-6">
                  {adminFaqs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-6 flex flex-col gap-4"
                    >
                      <Input
                        id={`faq-q-${index}`}
                        label={`Question #${index + 1}`}
                        value={faq.question}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminFaqs((prev) =>
                            prev.map((f, i) => (i === index ? { ...f, question: val } : f))
                          );
                        }}
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-bold text-[#171412]">Answer</label>
                        <textarea
                          rows={3}
                          value={faq.answer}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminFaqs((prev) =>
                              prev.map((f, i) => (i === index ? { ...f, answer: val } : f))
                            );
                          }}
                          className="w-full p-3 rounded-[10px] bg-[#fff] border border-[#171412]/25 text-[14px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            TAB 4: COURSES & PROMO CODES CONTROL CENTER
        ===================================================================== */}
        {activeTab === 'courses' && (
          <section aria-label="Course and promo code management" className="flex flex-col gap-6">
            {/* Header Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[16px] bg-[#f2f0e7] border-2 border-[#171412]">
              <div>
                <span className="text-[12px] font-extrabold text-[#813502] uppercase tracking-wider block mb-1">
                  {t('লাইভ কোর্স ও ছাড় কন্ট্রোল প্যানেল', 'Live Course & Discount Control Panel')}
                </span>
                <h2 className="font-display text-[26px] sm:text-[32px] font-extrabold text-[#171412] leading-tight">
                  {t('কোর্স ও প্রোমো কোড ব্যবস্থাপনা', 'Course & Promo Code Management')}
                </h2>
                <p className="text-[14px] text-[#171412]/80 mt-1 max-w-2xl leading-relaxed">
                  {t(
                    'রেজিস্ট্রেশন শেষে শিক্ষার্থীরা কোন কোন কোর্স দেখতে পারবে (যেমন: ড্রপশিপিং রিসেলিং, মার্কেটিং কিভাবে করবেন, কোর্স শিখুন), সেগুলোর ফি (১,০০০ টাকা বা কাস্টম) এবং প্রোমো কোড এখান থেকে যোগ বা পরিবর্তন করুন।',
                    'Manage courses shown after registration (e.g. Dropshipping Reselling, Marketing Strategy, Learn Course), adjust 1,000 BDT or custom fees, and configure discount promo codes.'
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {coursesSubTab === 'courses' ? (
                  <>
                    <button
                      type="button"
                      onClick={openNewCourseModal}
                      className="min-h-[44px] px-5 py-2 rounded-[50px] bg-[#ff7722] hover:bg-[#ff8f44] text-[#171412] font-display text-[14px] font-extrabold border-2 border-[#171412] shadow-sm inline-flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <span>+ {t('নতুন কোর্স যোগ করুন', 'Add New Course')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreDefaultCoursesList}
                      className="min-h-[44px] px-4 py-2 rounded-[50px] bg-[#fbf9ef] hover:bg-[#fff] text-[#171412] text-[12px] font-bold border border-[#171412]/30 transition-colors cursor-pointer"
                    >
                      {t('ডিফল্ট ৩টি কোর্স পুনরুদ্ধার', 'Reset Default Courses')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={openNewPromoModal}
                      className="min-h-[44px] px-5 py-2 rounded-[50px] bg-[#ff7722] hover:bg-[#ff8f44] text-[#171412] font-display text-[14px] font-extrabold border-2 border-[#171412] shadow-sm inline-flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <span>+ {t('নতুন প্রোমো কোড তৈরি করুন', 'Create Promo Code')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreDefaultPromosList}
                      className="min-h-[44px] px-4 py-2 rounded-[50px] bg-[#fbf9ef] hover:bg-[#fff] text-[#171412] text-[12px] font-bold border border-[#171412]/30 transition-colors cursor-pointer"
                    >
                      {t('ডিফল্ট প্রোমো কোড পুনরুদ্ধার', 'Reset Default Promos')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Feedback notification */}
            {courseFeedback && (
              <div
                role="status"
                aria-live="polite"
                className="p-4 rounded-[12px] bg-[#e8f5e9] border-2 border-[#2e7d32] text-[#1b5e20] text-[14px] font-bold flex items-center justify-between animate-fadeIn"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSvgIcon className="w-5 h-5 text-[#2e7d32] shrink-0" />
                  <span>{courseFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCourseFeedback('')}
                  className="text-[12px] underline text-[#1b5e20] cursor-pointer font-semibold"
                >
                  {t('বাতিল', 'Dismiss')}
                </button>
              </div>
            )}

            {/* Sub-tab navigation: Courses vs Promo Codes */}
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#171412]/15 pb-3">
              <button
                type="button"
                onClick={() => setCoursesSubTab('courses')}
                className={`min-h-[42px] px-6 py-2 rounded-[50px] text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  coursesSubTab === 'courses'
                    ? 'bg-[#171412] text-[#fbf9ef] shadow-sm'
                    : 'bg-[#f2f0e7] text-[#171412] hover:bg-[#ebe9df] border border-[#171412]/20'
                }`}
              >
                <span>📚 {t('কোর্স তালিকা', 'Available Courses')}</span>
                <span className="px-2 py-0.2 rounded-full bg-[#ff7722] text-[#171412] text-[11px] font-black">
                  {adminCourses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCoursesSubTab('promos')}
                className={`min-h-[42px] px-6 py-2 rounded-[50px] text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  coursesSubTab === 'promos'
                    ? 'bg-[#171412] text-[#fbf9ef] shadow-sm'
                    : 'bg-[#f2f0e7] text-[#171412] hover:bg-[#ebe9df] border border-[#171412]/20'
                }`}
              >
                <span>🏷️ {t('প্রোমো কোড ও ছাড়', 'Promo Codes & Discounts')}</span>
                <span className="px-2 py-0.2 rounded-full bg-[#ffc765] text-[#171412] text-[11px] font-black">
                  {adminPromoCodes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCoursesSubTab('enrollments')}
                className={`min-h-[42px] px-6 py-2 rounded-[50px] text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  coursesSubTab === 'enrollments'
                    ? 'bg-[#171412] text-[#fbf9ef] shadow-sm'
                    : 'bg-[#f2f0e7] text-[#171412] hover:bg-[#ebe9df] border border-[#171412]/20'
                }`}
              >
                <span>🎓 {t('ভর্তি আবেদন', 'Student Enrollments')}</span>
                <span className="px-2 py-0.2 rounded-full bg-[#22c55e] text-white text-[11px] font-black">
                  {studentEnrollments.length}
                </span>
                {studentEnrollments.filter((e) => e.status === 'pending').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                )}
              </button>
            </div>

            {/* -------------------------------------------------------------
                SUB-VIEW 1: COURSES LIST
            -------------------------------------------------------------- */}
            {coursesSubTab === 'courses' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-bold text-[#813502]">
                    {t(
                      `মোট ${adminCourses.length} টি কোর্স কনফিগার করা রয়েছে (${adminCourses.filter((c) => c.isActive).length} টি লাইভ/সক্রিয়)`,
                      `Total ${adminCourses.length} course(s) configured (${adminCourses.filter((c) => c.isActive).length} active/live)`
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={openNewCourseModal}
                    className="text-[13px] font-bold text-[#ff7722] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{t('আরেকটি কোর্স যুক্ত করুন', 'Add another course')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminCourses.map((course, idx) => (
                    <div
                      key={course.id}
                      className={`rounded-[18px] border-2 p-6 flex flex-col justify-between transition-all ${
                        course.isActive
                          ? 'bg-[#ffffff] border-[#171412] shadow-sm'
                          : 'bg-[#f8f6f0] border-[#171412]/30 opacity-75'
                      }`}
                    >
                      <div>
                        {/* Course Thumbnail in Admin Card */}
                        {course.thumbnailUrl && (
                          <div className="relative aspect-[16/9] w-full rounded-[12px] overflow-hidden mb-3.5 border border-[#171412]/20 bg-[#171412]">
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
                              {course.enrollmentType === 'promo_only'
                                ? '🏷️ শুধুমাত্র প্রমো কোড'
                                : course.enrollmentType === 'both'
                                ? 'টাকা বা প্রমো কোড'
                                : 'পেইড কোর্স'}
                            </div>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-0.5 rounded-[50px] bg-[#f2f0e7] border border-[#171412]/20 text-[#813502] text-[11px] font-extrabold uppercase tracking-wide">
                            {course.category}
                          </span>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {course.isRunning && (
                              <span className="px-2.5 py-0.5 rounded-[50px] bg-[#ff7722] text-[#171412] text-[10px] font-black flex items-center gap-1 border border-[#171412] shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#171412]" />
                                চলতি কোর্স (Running)
                              </span>
                            )}
                            {course.batchName && (
                              <span className="px-2 py-0.5 rounded-[50px] bg-[#fbf9ef] text-[#813502] text-[10px] font-extrabold border border-[#171412]/20">
                                {course.batchName}
                              </span>
                            )}
                            {course.isVisible === false && (
                              <span className="px-2 py-0.5 rounded-[50px] bg-stone-200 text-stone-700 text-[10px] font-bold">
                                লুকানো (Hidden)
                              </span>
                            )}
                            {course.badge && (
                              <span className="px-2 py-0.5 rounded-[50px] bg-[#ff7722]/30 text-[#171412] text-[10px] font-extrabold">
                                {course.badge}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-[50px] text-[10px] font-extrabold border ${
                                course.isActive
                                  ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#2e7d32]/30'
                                  : 'bg-[#f3f4f6] text-[#6b7280] border-[#9ca3af]/40'
                              }`}
                            >
                              {course.isActive ? '● সক্রিয়' : '○ ড্রাফট'}
                            </span>
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <h3 className="font-display text-[20px] font-extrabold text-[#171412] leading-snug mb-2">
                          {course.title}
                        </h3>
                        <p className="text-[13px] text-[#171412]/80 leading-relaxed mb-4">
                          {course.subtitle}
                        </p>

                        {/* Detailed Description */}
                        {course.description && (
                          <p className="text-[12px] text-[#171412]/65 line-clamp-2 mb-4 italic">
                            &ldquo;{course.description}&rdquo;
                          </p>
                        )}

                        {/* Highlights */}
                        <div className="mb-4 pt-3 border-t border-[#171412]/10">
                          <span className="text-[11px] font-bold text-[#813502] uppercase tracking-wider block mb-1.5">
                            {t('মূল মডিউল ও সুবিধাসমূহ:', 'Highlights:')}
                          </span>
                          <ul className="space-y-1.5 text-[12px] text-[#171412]/85">
                            {course.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#813502] font-bold">✓</span>
                                <span className="line-clamp-1">{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Footer: Price, Duration & Action buttons */}
                      <div className="pt-4 border-t border-[#171412]/15">
                        <div className="flex items-baseline justify-between mb-4">
                          <div>
                            <span className="text-[11px] text-[#171412]/60 block font-medium">
                              {course.duration}
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="font-display text-[22px] font-extrabold text-[#171412] tabular-nums">
                                ৳{(course.discountPrice !== undefined ? course.discountPrice : course.price).toLocaleString()}
                              </span>
                              {course.discountPrice !== undefined && course.discountPrice < course.price && (
                                <span className="text-[12px] text-[#171412]/50 line-through tabular-nums">
                                  ৳{course.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[11px] text-[#813502] font-bold bg-[#ffc765]/40 px-2 py-1 rounded">
                            {course.promoCodeEligible ? '🏷️ প্রোমো কোড প্রযোজ্য' : 'প্রোমো ছাড় নেই'}
                          </span>
                        </div>

                        {/* Card Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-[#171412]/10">
                          <button
                            type="button"
                            onClick={() => openEditCourseModal(course)}
                            className="py-1.5 px-2.5 rounded-[8px] bg-[#f2f0e7] hover:bg-[#ebe9df] border border-[#171412]/20 text-[12px] font-bold text-[#171412] transition-colors cursor-pointer text-center"
                          >
                            ✏️ {t('সম্পাদনা', 'Edit')}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetRunningCourse(course.id)}
                            className={`py-1.5 px-2.5 rounded-[8px] text-[11px] font-extrabold border transition-colors cursor-pointer ${
                              course.isRunning
                                ? 'bg-[#ff7722] text-[#171412] border-[#171412]'
                                : 'bg-[#fff] text-[#813502] border-[#171412]/25 hover:bg-[#ffc765]/30'
                            }`}
                            title="চলতি কোর্স হিসেবে সেট করুন"
                          >
                            {course.isRunning ? '★ চলতি কোর্স' : 'চলতি বানান'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleCourseVisibility(course.id)}
                            className="py-1.5 px-2 rounded-[8px] text-[11px] font-bold border border-[#171412]/20 bg-[#fff] text-[#171412] hover:bg-[#f2f0e7] transition-colors cursor-pointer"
                            title={course.isVisible !== false ? 'লুকান (Hide from public)' : 'দৃশ্যমান করুন (Make visible)'}
                          >
                            {course.isVisible !== false ? '👀 দৃশ্যমান' : '🙈 লুকানো'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleCourseActive(course.id)}
                            className={`py-1.5 px-2 rounded-[8px] text-[11px] font-bold border transition-colors cursor-pointer ${
                              course.isActive
                                ? 'bg-[#fff] text-[#813502] border-[#171412]/20 hover:bg-[#ffc765]/30'
                                : 'bg-[#e8f5e9] text-[#1b5e20] border-[#2e7d32]/30 hover:bg-[#c8e6c9]'
                            }`}
                          >
                            {course.isActive ? 'পজ' : 'সক্রিয়'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`আপনি কি নিশ্চিত যে "${course.title}" কোর্সটি মুছে ফেলতে চান?`)) {
                                handleDeleteCourse(course.id);
                              }
                            }}
                            className="py-1.5 px-2 rounded-[8px] text-[12px] font-bold text-[#ff3c34] hover:bg-[#fff0f0] transition-colors cursor-pointer"
                            title={t('মুছে ফেলুন', 'Delete')}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SUB-VIEW 2: PROMO CODES LIST
            -------------------------------------------------------------- */}
            {coursesSubTab === 'promos' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-[20px] font-extrabold text-[#171412]">
                      {t('উপলব্ধ প্রোমো কোড ও ছাড় কনফিগারেশন (Promo Code Manager)', 'Promo Code Manager & Discount Config')}
                    </h3>
                    <p className="text-[13px] text-[#813502] font-semibold mt-0.5">
                      {t(
                        'শিক্ষার্থীরা পেমেন্ট পেজে এই কোডগুলো প্রদান করে ছাড় উপভোগ করতে পারবে। সর্বোচ্চ ৫০% ছাড় সমর্থিত।',
                        'Students enter these codes on the payment page for percentage discounts (max 50% enforced).'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openNewPromoModal}
                    className="min-h-[40px] px-5 py-2 rounded-[50px] bg-[#059669] text-white font-bold text-[13px] border-2 border-[#171412] hover:bg-[#047857] shadow-[2px_2px_0px_#171412] cursor-pointer shrink-0"
                  >
                    + {t('নতুন প্রোমো কোড তৈরি', 'Create Promo Code')}
                  </button>
                </div>

                {/* Filters and Search Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-white rounded-2xl border-2 border-[#171412]">
                  {/* Search input */}
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="search"
                      value={promoSearchQuery}
                      onChange={(e) => setPromoSearchQuery(e.target.value)}
                      placeholder={t('প্রোমো কোড দিয়ে খুঁজুন (e.g. EARLY20)...', 'Search promo code...')}
                      className="w-full px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-xl bg-[#fbf9ef] border-2 border-[#171412]/15 focus:border-[#059669] outline-none"
                    />
                  </div>

                  {/* Course Filter Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#171412] shrink-0">কোর্স ফিল্টার:</label>
                    <select
                      value={promoCourseFilter}
                      onChange={(e) => setPromoCourseFilter(e.target.value)}
                      className="px-3 py-2 text-xs font-bold rounded-xl bg-[#fbf9ef] border-2 border-[#171412]/15 focus:border-[#059669] outline-none cursor-pointer"
                    >
                      <option value="ALL">🌟 All Courses (সকল কোর্স)</option>
                      {adminCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          📚 {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#171412] shrink-0">স্ট্যাটাস:</label>
                    <select
                      value={promoStatusFilter}
                      onChange={(e) => setPromoStatusFilter(e.target.value as any)}
                      className="px-3 py-2 text-xs font-bold rounded-xl bg-[#fbf9ef] border-2 border-[#171412]/15 focus:border-[#059669] outline-none cursor-pointer"
                    >
                      <option value="all">সব (All)</option>
                      <option value="active">সক্রিয় (Active)</option>
                      <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                    </select>
                  </div>
                </div>

                {/* Promo Code Table */}
                <div className="bg-white rounded-2xl border-2 border-[#171412] shadow-[6px_6px_0px_#171412] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f2f0e7] border-b-2 border-[#171412] text-[11px] font-black uppercase text-[#171412]">
                          <th className="p-3.5 pl-5">প্রোমো কোড (Code)</th>
                          <th className="p-3.5">প্রযোজ্য কোর্স (Course)</th>
                          <th className="p-3.5 text-center">ছাড় (%)</th>
                          <th className="p-3.5 text-center">ব্যবহার সংখ্যা (Used / Limit)</th>
                          <th className="p-3.5 text-center">মেয়াদ শেষের তারিখ</th>
                          <th className="p-3.5 text-center">স্ট্যাটাস</th>
                          <th className="p-3.5 pr-5 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#171412]/10 text-xs">
                        {adminPromoCodes
                          .filter((p) => {
                            if (promoStatusFilter === 'active' && !p.isActive) return false;
                            if (promoStatusFilter === 'inactive' && p.isActive) return false;
                            if (promoCourseFilter !== 'ALL' && p.applicableCourseId !== 'ALL' && p.applicableCourseId !== promoCourseFilter) return false;
                            if (promoSearchQuery.trim()) {
                              const q = promoSearchQuery.trim().toUpperCase();
                              const matchCode = p.code.toUpperCase().includes(q);
                              const matchDesc = p.description?.toUpperCase().includes(q);
                              return matchCode || matchDesc;
                            }
                            return true;
                          })
                          .map((promo) => {
                            const applicableCourse = adminCourses.find((c) => c.id === promo.applicableCourseId);
                            const used = promo.usedCount || 0;
                            const limit = promo.usageLimit || 50;
                            const isLimitReached = used >= limit;

                            return (
                              <tr key={promo.id} className="hover:bg-[#fbf9ef]/60 transition-colors">
                                <td className="p-3.5 pl-5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-sm text-[#059669] bg-[#f0fdf4] px-2.5 py-1 rounded-lg border border-[#059669]/30">
                                      {promo.code}
                                    </span>
                                  </div>
                                  {promo.description && (
                                    <p className="text-[10px] text-[#171412]/60 mt-0.5">{promo.description}</p>
                                  )}
                                </td>
                                <td className="p-3.5 font-bold text-[#171412]">
                                  {promo.applicableCourseId === 'ALL' ? (
                                    <span className="text-[#059669] bg-[#f0fdf4] px-2 py-0.5 rounded border border-[#059669]/20">
                                      🌟 All Courses
                                    </span>
                                  ) : (
                                    <span>📚 {applicableCourse?.title || promo.applicableCourseId}</span>
                                  )}
                                </td>
                                <td className="p-3.5 text-center font-black text-sm text-[#059669]">
                                  {promo.percentage}% OFF
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className={`font-mono font-bold px-2 py-1 rounded-md border text-xs ${
                                    isLimitReached 
                                      ? 'bg-red-50 text-red-700 border-red-200' 
                                      : 'bg-[#fbf9ef] text-[#171412] border-[#171412]/20'
                                  }`}>
                                    {used} / {limit}
                                  </span>
                                </td>
                                <td className="p-3.5 text-center font-medium text-[#171412]/70">
                                  {promo.expiresAt ? promo.expiresAt : 'মেয়াদহীন (Never)'}
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                    promo.isActive && !isLimitReached
                                      ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#2e7d32]/30'
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                    {!promo.isActive ? 'নিষ্ক্রিয়' : isLimitReached ? 'লিমিট শেষ' : 'সক্রিয়'}
                                  </span>
                                </td>
                                <td className="p-3.5 pr-5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditPromoModal(promo)}
                                      className="px-2.5 py-1 bg-[#f2f0e7] hover:bg-[#ebe9df] text-[#171412] font-bold text-xs rounded-lg border border-[#171412]/20 cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = adminPromoCodes.map((p) =>
                                          p.id === promo.id ? { ...p, isActive: !p.isActive } : p
                                        );
                                        setAdminPromoCodes(updated);
                                        savePromoCodesList(updated);
                                      }}
                                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                                        promo.isActive
                                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                      }`}
                                    >
                                      {promo.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`প্রোমো কোড "${promo.code}" মুছে ফেলতে চান?`)) {
                                          handleDeletePromo(promo.id);
                                        }
                                      }}
                                      className="px-2 py-1 text-red-600 hover:bg-red-50 font-bold text-xs rounded-lg cursor-pointer"
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SUB-VIEW 3: STUDENT ENROLLMENTS & REGISTRATIONS
            -------------------------------------------------------------- */}
            {coursesSubTab === 'enrollments' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-[20px] font-extrabold text-[#171412]">
                      {t('কোর্স ভর্তি ও রেজিস্ট্রেশন আবেদনসমূহ', 'Course Registrations & Student Applications')}
                    </h3>
                    <p className="text-[13px] text-[#813502] font-semibold mt-0.5">
                      {t(
                        'শিক্ষার্থীরা রেজিস্ট্রেশন ফর্ম পূরণ করার পর তাদের সকল তথ্য ও পেমেন্ট/প্রমো কোড এখানে জমা হয়',
                        'Real-time student applications from course registration forms, including TrxID and Promo codes'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      fetchStudentEnrollments().then((list) => setStudentEnrollments(list));
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-[50px] bg-[#171412] text-white hover:bg-[#ff7722] hover:text-[#171412] font-bold text-[13px] transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    🔄 {t('রিফ্রেশ করুন', 'Refresh List')}
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-[#171412]/20">
                  <div className="flex-1 max-w-md">
                    <input
                      type="search"
                      value={enrollmentSearch}
                      onChange={(e) => setEnrollmentSearch(e.target.value)}
                      placeholder={t('শিক্ষার্থীর নাম, মোবাইল, TrxID বা কোর্স...', 'Search name, phone, TrxID or course...')}
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-[#fbf9ef] border border-[#171412]/30 focus:border-[#ff7722] outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEnrollmentStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                          enrollmentStatusFilter === st
                            ? 'bg-[#171412] text-white border-[#171412]'
                            : 'bg-[#fbf9ef] text-[#171412] border-[#171412]/20 hover:border-[#ff7722]'
                        }`}
                      >
                        {st === 'all'
                          ? `সব (${studentEnrollments.length})`
                          : st === 'pending'
                          ? `পেন্ডিং (${studentEnrollments.filter((e) => e.status === 'pending').length})`
                          : st === 'approved'
                          ? `অনুমোদিত (${studentEnrollments.filter((e) => e.status === 'approved').length})`
                          : `বাতিল (${studentEnrollments.filter((e) => e.status === 'rejected').length})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enrollments List Cards */}
                {studentEnrollments.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-[#171412]/30 text-sm text-[#171412]/60">
                    বর্তমানে কোনো ভর্তি আবেদন জমা হয়নি। ওয়েবসাইটে গিয়ে "রেজিস্ট্রেশন করুন" বাটনে ক্লিক করে প্রথম আবেদন করুন!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentEnrollments
                      .filter((item) => {
                        if (enrollmentStatusFilter !== 'all' && item.status !== enrollmentStatusFilter) {
                          return false;
                        }
                        if (enrollmentSearch.trim()) {
                          const q = enrollmentSearch.toLowerCase();
                          const matchName = item.studentName.toLowerCase().includes(q);
                          const matchPhone = item.studentPhone.includes(q);
                          const matchCourse = item.courseTitle.toLowerCase().includes(q);
                          const matchTrx = item.trxId?.toLowerCase().includes(q);
                          const matchPromo = item.promoCodeUsed?.toLowerCase().includes(q);
                          return matchName || matchPhone || matchCourse || matchTrx || matchPromo;
                        }
                        return true;
                      })
                      .map((enr) => (
                        <div
                          key={enr.id}
                          className="p-5 rounded-2xl bg-white border-2 border-[#171412] shadow-sm flex flex-col justify-between gap-4"
                        >
                          <div>
                            {/* Card Header: Course & Status */}
                            <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-[#171412]/15">
                              <div>
                                <span className="text-[10px] font-bold text-[#813502] uppercase tracking-wider bg-[#fef9c3] px-2 py-0.5 rounded border border-[#ca8a04]/40">
                                  {enr.courseCategory}
                                </span>
                                <h4 className="text-base font-bold text-[#171412] font-display mt-1">
                                  {enr.courseTitle}
                                </h4>
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                                  enr.status === 'approved'
                                    ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#2e7d32]'
                                    : enr.status === 'rejected'
                                    ? 'bg-[#fee2e2] text-[#991b1b] border-[#ef4444]'
                                    : 'bg-[#fef9c3] text-[#854d0e] border-[#ca8a04]'
                                }`}
                              >
                                {enr.status === 'approved'
                                  ? '✓ অনুমোদিত'
                                  : enr.status === 'rejected'
                                  ? '✕ বাতিল'
                                  : '⏳ পেন্ডিং'}
                              </span>
                            </div>

                            {/* Student Information Details */}
                            <div className="space-y-1.5 text-xs text-[#171412]/80">
                              <div className="flex items-baseline justify-between">
                                <span className="font-bold text-[#171412] text-sm">
                                  👤 {enr.studentName}
                                </span>
                                <span className="text-[11px] text-[#171412]/60">
                                  {new Date(enr.createdAt).toLocaleDateString('bn-BD', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#171412]">📱 ফোন:</span>
                                <a
                                  href={`tel:${enr.studentPhone}`}
                                  className="font-mono font-bold text-[#ff7722] hover:underline"
                                >
                                  {enr.studentPhone}
                                </a>
                              </div>

                              {enr.studentEmail && (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#171412]">✉️ ইমেইল:</span>
                                  <span>{enr.studentEmail}</span>
                                </div>
                              )}

                              {enr.district && (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[#171412]">📍 জেলা/ঠিকানা:</span>
                                  <span>{enr.district}</span>
                                </div>
                              )}

                              {/* Enrollment Validation Details */}
                              <div className="mt-3 p-2.5 rounded-xl bg-[#fbf9ef] border border-[#171412]/20 font-mono text-xs">
                                {enr.promoCodeUsed ? (
                                  <div className="flex items-center justify-between">
                                    <span className="font-sans font-bold text-[#15803d]">🏷️ প্রমো কোড এন্ট্রি:</span>
                                    <span className="font-bold text-[#15803d] bg-white px-2 py-0.5 rounded border border-[#15803d]/30">
                                      {enr.promoCodeUsed}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex justify-between font-sans">
                                      <span className="font-bold text-[#171412]">পেমেন্ট মাধ্যম:</span>
                                      <span className="font-bold text-[#ff7722]">{enr.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-sans text-[#171412]/70">টাকা পাঠানো নম্বর:</span>
                                      <span className="font-bold">{enr.senderPhone || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-sans text-[#171412]/70">Transaction ID:</span>
                                      <span className="font-bold text-[#171412] bg-white px-1.5 py-0.2 rounded border">
                                        {enr.trxId || '-'}
                                      </span>
                                    </div>
                                    {enr.amountPaid !== undefined && (
                                      <div className="flex justify-between font-sans border-t pt-1">
                                        <span className="text-[#171412]/70">পরিশোধিত ফি:</span>
                                        <span className="font-bold">৳{enr.amountPaid}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-[#171412]/15 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {enr.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveEnrollment(enr.id)}
                                  className="px-3 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs rounded-lg transition"
                                >
                                  ✓ অনুমোদন
                                </button>
                              )}
                              {enr.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleRejectEnrollment(enr.id)}
                                  className="px-3 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs rounded-lg transition"
                                >
                                  ✕ বাতিল
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteEnrollment(enr.id)}
                                className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#171412] font-bold text-xs rounded-lg transition"
                                title="মুছে ফেলুন"
                              >
                                🗑️
                              </button>
                            </div>

                            <a
                              href={`https://wa.me/88${enr.studentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `আসসালামু আলাইকুম ${enr.studentName}, ড্রপশিপিং একাডেমি বাংলাদেশ থেকে আপনার "${enr.courseTitle}" কোর্সের রেজিস্ট্রেশন সংক্রান্ত তথ্য জানাতে যোগাযোগ করছি।`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebc59] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
                            >
                              <span>💬 হোয়াটসঅ্যাপ</span>
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            MODAL: BANGLA CUSTOM EMAIL & STATUS UPDATE NOTIFICATION
        ===================================================================== */}
        {emailModalUser && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#171412]/75 backdrop-blur-xs overflow-y-auto"
          >
            <div className="relative w-full max-w-2xl bg-[#ffffff] border-2 border-[#171412] rounded-[16px] shadow-[8px_8px_0px_#171412] p-5 sm:p-7 my-8 max-h-[92vh] overflow-y-auto">
              
              {/* Modal Top Bar */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#171412]/15 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-[50px] text-[11px] font-extrabold uppercase tracking-wide border ${
                        emailModalAction === 'approved'
                          ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#2e7d32]/40'
                          : 'bg-[#fef2f2] text-[#991b1b] border-[#ef4444]/40'
                      }`}
                    >
                      {emailModalAction === 'approved' ? '✓ অনুমোদন (Approved)' : '✕ প্রত্যাখ্যান (Rejected)'}
                    </span>
                    <span className="text-[12px] font-bold text-[#813502]">
                      Nodemailer Bangla Email
                    </span>
                  </div>
                  <h2
                    id="email-modal-title"
                    className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#171412] leading-tight"
                  >
                    {emailModalAction === 'approved'
                      ? 'আবেদন অনুমোদন ও বাংলা ইমেইল নোটিফিকেশন'
                      : 'আবেদন প্রত্যাখ্যান ও বাংলা ইমেইল নোটিফিকেশন'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setEmailModalUser(null)}
                  disabled={isSendingStatusEmail}
                  className="w-9 h-9 rounded-full bg-[#f2f0e7] hover:bg-[#e2e0d7] border border-[#171412]/30 flex items-center justify-center text-[#171412] font-bold transition-colors cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Recipient Details Pill */}
              <div className="p-3.5 rounded-[12px] bg-[#fbf9ef] border border-[#171412]/20 mb-5 text-[13px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-[#813502]">প্রাপক: </span>
                    <strong className="text-[#171412]">
                      {emailModalUser.first_name} {emailModalUser.last_name}
                    </strong>
                    <span className="text-[#171412]/60 font-mono text-[11px] ml-1.5">
                      ({emailModalUser.email})
                    </span>
                  </div>
                  <div className="text-[12px] text-[#171412]/75">
                    WhatsApp: <span className="font-semibold text-[#171412]">{emailModalUser.whatsapp}</span>
                  </div>
                </div>
              </div>

              {/* Action Switcher */}
              <div className="mb-5">
                <label className="block text-[12px] font-bold text-[#813502] mb-1.5">
                  স্ট্যাটাস ও নোটিফিকেশন ধরন:
                </label>
                <div className="inline-flex p-1 rounded-[10px] bg-[#f2f0e7] border border-[#171412]/20 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailModalAction('approved');
                      setEmailModalSubject('অভিনন্দন! ড্রপশিপিং একাডেমিতে আপনার আবেদন অনুমোদিত হয়েছে 🎉');
                      setEmailModalCustomMessage(
                        'আপনার প্রোফাইল ও উদ্যোক্তা হওয়ার আগ্রহ পর্যালোচনা করে কোহর্ট ০১ ব্যাচে আপনার আবেদন অনুমোদিত করা হয়েছে। পরবর্তী ৪৮ ঘণ্টার মধ্যে বিস্তারিত অনবোর্ডিং নির্দেশনা ও ব্যাচ শিডিউল পাঠানো হবে।'
                      );
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-[8px] text-[12px] font-extrabold transition-colors cursor-pointer ${
                      emailModalAction === 'approved'
                        ? 'bg-[#2e7d32] text-[#fff]'
                        : 'text-[#171412] hover:bg-[#fff]/50'
                    }`}
                  >
                    ✓ অনুমোদন (Approve)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailModalAction('rejected');
                      setEmailModalSubject('ড্রপশিপিং একাডেমি আবেদন সংক্রান্ত আপডেট 📋');
                      setEmailModalCustomMessage(
                        'সীমিত আসন ও ব্যাপক সংখ্যক প্রার্থীর কারণে এই কোহর্টে আপনার আবেদনটি এই মুহূর্তে বিবেচনা করা সম্ভব হয়নি। পরবর্তী কোহর্টে আবেদনের জন্য আপনাকে আন্তরিক অনুরোধ জানাচ্ছি।'
                      );
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-[8px] text-[12px] font-extrabold transition-colors cursor-pointer ${
                      emailModalAction === 'rejected'
                        ? 'bg-[#991b1b] text-[#fff]'
                        : 'text-[#171412] hover:bg-[#fff]/50'
                    }`}
                  >
                    ✕ প্রত্যাখ্যান (Reject)
                  </button>
                </div>
              </div>

              {/* Email Form Fields */}
              <div className="flex flex-col gap-4 mb-5">
                <div>
                  <label htmlFor="modal-email-subject" className="block text-[13px] font-bold text-[#171412] mb-1">
                    ইমেইল সাবজেক্ট (Email Subject in Bangla):
                  </label>
                  <input
                    id="modal-email-subject"
                    type="text"
                    value={emailModalSubject}
                    onChange={(e) => setEmailModalSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412] focus:border-[#ff7722] focus:outline-none"
                    placeholder="বাংলা ইমেইল সাবজেক্ট লিখুন..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label htmlFor="modal-custom-message" className="text-[13px] font-bold text-[#171412]">
                      কাস্টম বার্তা / আপডেট নোট (Custom Bangla Message):
                    </label>
                    <span className="text-[11px] text-[#813502] font-semibold">
                      ইমেইলের ভেতর হাইলাইট বক্সে প্রদর্শিত হবে
                    </span>
                  </div>
                  <textarea
                    id="modal-custom-message"
                    rows={4}
                    value={emailModalCustomMessage}
                    onChange={(e) => setEmailModalCustomMessage(e.target.value)}
                    className="w-full p-3 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412] leading-relaxed focus:border-[#ff7722] focus:outline-none"
                    placeholder="এখানে আবেদনকারীর জন্য কোনো কাস্টম আপডেট, কারণ, কোহর্ট শুরুর তারিখ বা দিকনির্দেশনা লিখুন..."
                  />
                  <p className="text-[11px] text-[#171412]/65 mt-1">
                    টিপস: আপনি চাইলে এটি পরিবর্তন করতে পারেন অথবা ডিফল্ট বার্তাটি ব্যবহার করতে পারেন।
                  </p>
                </div>

                {/* Send via Nodemailer Checkbox */}
                <label className="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#fbf9ef] border border-[#171412]/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={emailModalSendEmail}
                    onChange={(e) => setEmailModalSendEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-[#ff7722] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[13px] font-bold text-[#171412]">
                    Nodemailer দিয়ে আবেদনকারীর ইমেইলে এই বাংলা বার্তাটি পাঠান
                  </span>
                </label>

                {/* Preview Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview((prev) => !prev)}
                    className="text-[12px] font-extrabold text-[#813502] hover:text-[#171412] underline underline-offset-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{showEmailPreview ? '▲ ইমেইল প্রিভিউ লুকান' : '👁️ বাংলা ইমেইল লাইভ প্রিভিউ দেখুন'}</span>
                  </button>
                </div>

                {/* Email Live Preview Box */}
                {showEmailPreview && (
                  <div className="p-4 rounded-[12px] bg-[#fbf9ef] border-2 border-[#171412] text-[13px] leading-relaxed max-h-72 overflow-y-auto">
                    <div className="p-3 bg-[#171412] text-[#fbf9ef] rounded-[8px] mb-3 text-center">
                      <div className="font-bold text-[14px]">Dropshipping Academy</div>
                      <div className="text-[11px] opacity-80">
                        {emailModalAction === 'approved' ? '✅ আবেদন অনুমোদন নোটিফিকেশন' : 'ℹ️ আবেদন সংক্রান্ত নোটিফিকেশন'}
                      </div>
                    </div>

                    <div className="font-bold text-[15px] mb-2 text-[#171412]">
                      প্রিয় {emailModalUser.first_name} {emailModalUser.last_name},
                    </div>

                    <p className="text-[#171412]/90 mb-3">
                      {emailModalAction === 'approved'
                        ? 'আমরা আনন্দের সাথে জানাচ্ছি যে ড্রপশিপিং একাডেমি (Dropshipping Academy) কোহর্ট ০১-এর জন্য আপনার আবেদনটি সফলভাবে অনুমোদিত হয়েছে!'
                        : 'ড্রপশিপিং একাডেমিতে আগ্রহ প্রকাশের জন্য আপনাকে ধন্যবাদ। অত্যন্ত সতর্কতার সাথে পর্যালোচনার পর দুঃখের সাথে জানাচ্ছি যে, এই কোহর্টে সীমিত আসনের কারণে এই মুহূর্তে আপনার আবেদনটি গ্রহণ করা সম্ভব হয়নি।'}
                    </p>

                    {emailModalCustomMessage.trim() && (
                      <div
                        className={`p-3 rounded-[8px] border my-3 ${
                          emailModalAction === 'approved'
                            ? 'bg-[#fff9e6] border-[#ff7722] text-[#813502]'
                            : 'bg-[#f3f4f6] border-[#6b7280] text-[#1f2937]'
                        }`}
                      >
                        <div className="font-bold text-[12px] mb-1">
                          {emailModalAction === 'approved' ? '📢 অ্যাডমিন বার্তা ও নির্দেশনা:' : '📝 অ্যাডমিন মন্তব্য:'}
                        </div>
                        <div className="whitespace-pre-line text-[13px]">{emailModalCustomMessage.trim()}</div>
                      </div>
                    )}

                    <div className="text-[12px] text-[#171412]/70 pt-2 border-t border-[#171412]/15">
                      সাপোর্ট: support@dropshippingacademy.io
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#171412]/15">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEmailModalUser(null)}
                  disabled={isSendingStatusEmail}
                >
                  বাতিল করুন
                </Button>

                <Button
                  type="button"
                  variant={emailModalAction === 'approved' ? 'primary' : 'orange'}
                  isLoading={isSendingStatusEmail}
                  loadingText="ইমেইল পাঠানো হচ্ছে..."
                  onClick={handleConfirmStatusAndEmail}
                >
                  <span>
                    {emailModalAction === 'approved'
                      ? 'অনুমোদন নিশ্চিত করুন ও ইমেইল পাঠান'
                      : 'প্রত্যাখ্যান নিশ্চিত করুন ও ইমেইল পাঠান'}
                  </span>
                  <ArrowRightSvgIcon className="w-4 h-4" />
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 1: ADD / EDIT COURSE
        ===================================================================== */}
        {isCourseModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#171412]/75 backdrop-blur-xs overflow-y-auto"
          >
            <div className="relative w-full max-w-2xl bg-[#ffffff] border-2 border-[#171412] rounded-[16px] shadow-[8px_8px_0px_#171412] p-5 sm:p-7 my-8 max-h-[92vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#171412]/15 mb-5">
                <div>
                  <span className="text-[11px] font-extrabold text-[#813502] uppercase tracking-wider block mb-0.5">
                    {editingCourseId ? 'কোর্স তথ্য সম্পাদনা' : 'নতুন কোর্স তৈরি'}
                  </span>
                  <h2
                    id="course-modal-title"
                    className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#171412]"
                  >
                    {editingCourseId ? 'কোর্সের বিস্তারিত পরিবর্তন করুন' : 'অ্যাডমিন থেকে নতুন কোর্স যুক্ত করুন'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#f2f0e7] hover:bg-[#e2e0d7] border border-[#171412]/30 flex items-center justify-center text-[#171412] font-bold transition-colors cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="flex flex-col gap-4 text-left">
                {/* Batch Name & Course Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="course-batch-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                      ব্যাচের নাম (Batch Name)
                    </label>
                    <input
                      id="course-batch-input"
                      type="text"
                      value={courseForm.batchName}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, batchName: e.target.value }))}
                      placeholder="যেমন: Sakku Batch 1 বা সাক্কু ব্যাচ ০১"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412] focus:border-[#ff7722] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="course-title-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                      কোর্সের নাম (Course Title) *
                    </label>
                    <input
                      id="course-title-input"
                      type="text"
                      required
                      value={courseForm.title}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="যেমন: ড্রপশিপিং ও রিসেলিং মাস্টারক্লাস"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412] focus:border-[#ff7722] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category & Presets */}
                <div>
                  <label htmlFor="course-category-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                    ক্যাটাগরি (Category) *
                  </label>
                  <input
                    id="course-category-input"
                    type="text"
                    required
                    value={courseForm.category}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="যেমন: ড্রপশিপিং ই-কমার্স ব্যবসা / ড্রপশিপিং রিসেলার ব্যবসা / ডিজিটাল মার্কেটিং"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412] focus:border-[#ff7722] focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                    <span className="font-bold text-[#813502]">দ্রুত সিলেক্ট:</span>
                    {(['ড্রপশিপিং রিসেলিং', 'গ্লোবাল ড্রপশিপিং'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCourseForm((prev) => ({ ...prev, category: cat }))}
                        className={`px-2 py-0.5 rounded-[50px] border font-semibold cursor-pointer ${
                          courseForm.category === cat
                            ? 'bg-[#171412] text-white border-[#171412]'
                            : 'bg-[#f2f0e7] hover:bg-[#ffc765] border-[#171412]/20'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumbnail Image URL & Preset Thumbnails */}
                <div className="p-3.5 bg-[#fbf9ef] rounded-[12px] border border-[#171412]/20 space-y-2">
                  <label htmlFor="course-thumbnail-input" className="block text-[13px] font-bold text-[#171412]">
                    কোর্সের থাম্বনেইল ছবি (Course Thumbnail) *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    {courseForm.thumbnailUrl && (
                      <img
                        src={courseForm.thumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-24 h-16 object-cover rounded-lg border-2 border-[#171412] shrink-0"
                      />
                    )}
                    <div className="flex-1 w-full">
                      <input
                        id="course-thumbnail-input"
                        type="text"
                        required
                        value={courseForm.thumbnailUrl}
                        onChange={(e) => setCourseForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                        placeholder="/images/course_... অথবা https://..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#171412]/30 text-xs font-mono"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[10px] font-bold text-[#813502] mr-1">রেডি থাম্বনেইল:</span>
                        {[
                          { label: 'ই-কমার্স', url: '/images/course_shopify_ecommerce_1791567740931.jpg' },
                          { label: 'রিসেলার', url: '/images/course_dropshipping_basic_1791567728755.jpg' },
                          { label: 'মার্কেটিং', url: '/images/course_digital_marketing_1791567751610.jpg' },
                          { label: 'ল্যাপটপ স্টোর', url: '/images/hero_laptop_business_1791567717121.jpg' },
                        ].map((item) => (
                          <button
                            key={item.url}
                            type="button"
                            onClick={() => setCourseForm((prev) => ({ ...prev, thumbnailUrl: item.url }))}
                            className={`px-2 py-0.5 text-[10px] rounded border font-semibold ${
                              courseForm.thumbnailUrl === item.url
                                ? 'bg-[#ff7722] text-[#171412] border-[#171412]'
                                : 'bg-white text-[#171412] border-[#171412]/20'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enrollment Type & Promo Code Requirements */}
                <div className="p-3.5 bg-[#fef9c3] rounded-[12px] border-2 border-[#ca8a04] space-y-2.5">
                  <label className="block text-[13px] font-bold text-[#854d0e]">
                    ভর্তি মাধ্যম নির্ধারণ (Enrollment Method):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { type: 'payment', label: '💳 টাকা দিয়ে ভর্তি (পেইড)' },
                      { type: 'promo_only', label: '🏷️ শুধুমাত্র প্রমো কোড' },
                    ].map((mode) => (
                      <button
                        key={mode.type}
                        type="button"
                        onClick={() => setCourseForm((prev) => ({ ...prev, enrollmentType: mode.type as any }))}
                        className={`p-2 rounded-lg border-2 text-xs font-bold text-center transition ${
                          courseForm.enrollmentType === mode.type
                            ? 'bg-[#171412] text-white border-[#171412]'
                            : 'bg-white text-[#171412] border-[#ca8a04]/40 hover:border-[#ca8a04]'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {courseForm.enrollmentType === 'promo_only' && (
                    <div className="mt-2 pt-2 border-t border-[#ca8a04]/30">
                      <label htmlFor="course-req-promo" className="block text-xs font-bold text-[#854d0e] mb-1">
                        এই কোর্সের জন্য নির্দিষ্ট প্রমো কোড (বা খালি রাখুন):
                      </label>
                      <input
                        id="course-req-promo"
                        type="text"
                        placeholder="যেমন: RESELLER500 বা FREEPASS"
                        value={courseForm.requiredPromoCode}
                        onChange={(e) => setCourseForm((prev) => ({ ...prev, requiredPromoCode: e.target.value }))}
                        className="w-full px-3 py-1.5 uppercase font-mono text-xs bg-white rounded border border-[#ca8a04] outline-none"
                      />
                      <span className="text-[10px] text-[#854d0e] block mt-0.5">
                        শিক্ষার্থীরা এই কোর্সে ভর্তি হওয়ার সময় শুধুমাত্র এই প্রমো কোড (বা অ্যাডমিনের সক্রিয় কোড) দিয়ে জয়েন করতে পারবে।
                      </span>
                    </div>
                  )}
                </div>

                {/* Subtitle */}
                <div>
                  <label htmlFor="course-subtitle-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                    ট্যাগলাইন / সংক্ষিপ্ত উপশিরোনাম (Subtitle)
                  </label>
                  <input
                    id="course-subtitle-input"
                    type="text"
                    value={courseForm.subtitle}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="যেমন: পণ্য না কিনেই শূন্য ইনভেস্টমেন্টে রিসেলিং ও ড্রপশিপিংয়ের মাধ্যমে নিয়মিত আয়"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412] focus:border-[#ff7722] focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="course-desc-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                    কোর্সের বিস্তারিত বিবরণ (Description)
                  </label>
                  <textarea
                    id="course-desc-input"
                    rows={3}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="কোর্সের পূর্ণাঙ্গ সিলেবাস, সাপ্লায়ার নেটওয়ার্ক ও লাইভ সাপোর্ট সংক্রান্ত তথ্য..."
                    className="w-full p-3 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412] leading-relaxed focus:border-[#ff7722] focus:outline-none"
                  />
                </div>

                {/* Price, Discount Price & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="course-price-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                      মূল ফি (BDT) *
                    </label>
                    <input
                      id="course-price-input"
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={courseForm.price}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] font-bold text-[#171412]"
                    />
                    <span className="text-[10px] text-[#813502] font-semibold mt-0.5 block">যেমন: ১০০০ টাকা</span>
                  </div>

                  <div>
                    <label htmlFor="course-discount-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                      ছাড়ের মূল্য / অফার ফি (BDT)
                    </label>
                    <input
                      id="course-discount-input"
                      type="number"
                      min={0}
                      step={50}
                      value={courseForm.discountPrice}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, discountPrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] font-bold text-[#171412]"
                    />
                    <span className="text-[10px] text-[#813502] font-semibold mt-0.5 block">যেমন: ১০০০ টাকা</span>
                  </div>

                  <div>
                    <label htmlFor="course-duration-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                      ক্লাস সময়কাল (Duration)
                    </label>
                    <input
                      id="course-duration-input"
                      type="text"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="যেমন: ৮ সপ্তাহ · লাইভ ক্লাস"
                      className="w-full px-3 py-2 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412]"
                    />
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label htmlFor="course-highlights-input" className="text-[13px] font-bold text-[#171412]">
                      মূল বৈশিষ্ট্যসমূহ (Highlights - প্রতি লাইনে একটি):
                    </label>
                    <span className="text-[11px] text-[#813502] font-semibold">বুলেট পয়েন্ট হিসেবে দেখাবে</span>
                  </div>
                  <textarea
                    id="course-highlights-input"
                    rows={4}
                    value={courseForm.highlights}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, highlights: e.target.value }))}
                    placeholder="জিরো ইনভেন্টরি রিসেলিং মেথডোলজি&#10;ভেরিফাইড হোলসেল সাপ্লায়ার তালিকা&#10;প্রতি অর্ডারে ৩০০–১,৫০০ টাকা নিশ্চিত নিট মার্জিন"
                    className="w-full p-3 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[13px] text-[#171412] font-mono leading-relaxed focus:border-[#ff7722] focus:outline-none"
                  />
                </div>

                {/* Badge, Running Course & Visibility Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#171412]/15">
                  <div>
                    <label htmlFor="course-badge-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                      হাইলাইট ব্যাজ (Badge Text)
                    </label>
                    <input
                      id="course-badge-input"
                      type="text"
                      value={courseForm.badge}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, badge: e.target.value }))}
                      placeholder="যেমন: সবচেয়ে জনপ্রিয় / নতুন ব্যাচ"
                      className="w-full px-3 py-2 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[13px]"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#fff8eb] border border-[#ff7722]/40 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={courseForm.isRunning}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, isRunning: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#ff7722] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[12px] font-extrabold text-[#813502]">
                      ★ প্রধান চলতি কোর্স (Running Course)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#fbf9ef] border border-[#171412]/20 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={courseForm.isVisible}
                      onChange={(e) => setCourseForm((prev) => ({ ...prev, isVisible: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#ff7722] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[12px] font-bold text-[#171412]">
                      ওয়েবসাইটে দৃশ্যমান (Visible)
                    </span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#171412]/15">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCourseModalOpen(false)}
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    variant="orange"
                    isLoading={isSavingCourses}
                    loadingText="সংরক্ষণ হচ্ছে..."
                  >
                    {editingCourseId ? 'কোর্স পরিবর্তন সংরক্ষণ করুন' : 'নতুন কোর্স প্রকাশ করুন'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 2: ADD / EDIT PROMO CODE
        ===================================================================== */}
        {isPromoModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#171412]/75 backdrop-blur-xs overflow-y-auto"
          >
            <div className="relative w-full max-w-lg bg-[#ffffff] border-2 border-[#171412] rounded-[16px] shadow-[8px_8px_0px_#171412] p-5 sm:p-7 my-8">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#171412]/15 mb-5">
                <div>
                  <span className="text-[11px] font-extrabold text-[#813502] uppercase tracking-wider block mb-0.5">
                    {editingPromoId ? 'প্রোমো কোড সম্পাদনা' : 'নতুন প্রোমো কোড তৈরি'}
                  </span>
                  <h2
                    id="promo-modal-title"
                    className="font-display text-[22px] font-extrabold text-[#171412]"
                  >
                    {editingPromoId ? 'প্রোমো কোড আপডেট করুন' : 'নতুন ছাড় বা প্রোমো কোড যুক্ত করুন'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#f2f0e7] hover:bg-[#e2e0d7] border border-[#171412]/30 flex items-center justify-center text-[#171412] font-bold transition-colors cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePromo} className="flex flex-col gap-4 text-left">
                {/* Promo Code Text Input */}
                <div>
                  <label htmlFor="promo-code-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                    প্রোমো কোড (Promo Code Text) *
                  </label>
                  <input
                    id="promo-code-input"
                    type="text"
                    required
                    value={promoForm.code}
                    onChange={(e) => setPromoForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="যেমন: EARLY20 / SCHOLARSHIP50 / PROMO1000"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[15px] font-mono font-bold text-[#171412] uppercase focus:border-[#ff7722] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#171412]/60 mt-0.5 block">
                    যেকোনো কাস্টম টেক্সট প্রবেশ করান (স্বয়ংক্রিয়ভাবে বড় হাতের অক্ষরে সংরক্ষিত হবে)।
                  </span>
                </div>

                {/* Applicable Course Dropdown */}
                <div>
                  <label htmlFor="promo-course-select" className="block text-[13px] font-bold text-[#171412] mb-1">
                    প্রযোজ্য কোর্স (Applicable Course) *
                  </label>
                  <select
                    id="promo-course-select"
                    value={promoForm.applicableCourseId}
                    onChange={(e) => setPromoForm((prev) => ({ ...prev, applicableCourseId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[13px] font-bold text-[#171412] cursor-pointer"
                  >
                    <option value="ALL">🌟 All Courses (সকল কোর্সে প্রযোজ্য)</option>
                    {adminCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        📚 {c.title} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Discount Percentage (Strict max cap 50%) & Usage Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="promo-pct-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                      ছাড়ের পার্সেন্টেজ (%) * (সর্বোচ্চ ৫০%)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="promo-pct-input"
                        type="number"
                        required
                        min={1}
                        max={50}
                        value={promoForm.percentage}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPromoForm((prev) => ({
                            ...prev,
                            percentage: val > 50 ? 50 : val,
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] font-bold text-[#059669] focus:border-[#059669]"
                      />
                      <span className="absolute right-3 font-bold text-sm text-[#059669]">% OFF</span>
                    </div>
                    <span className="text-[10px] text-[#059669] font-bold mt-0.5 block">
                      সিস্টেম সিকিউরিটি অনুযায়ী সর্বোচ্চ ৫০% ছাড়ের ক্যাপ প্রযোজ্য।
                    </span>
                  </div>

                  <div>
                    <label htmlFor="promo-limit-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                      সর্বমোট ব্যবহার সীমা (Usage Limit) *
                    </label>
                    <input
                      id="promo-limit-input"
                      type="number"
                      required
                      min={1}
                      value={promoForm.usageLimit}
                      onChange={(e) => setPromoForm((prev) => ({ ...prev, usageLimit: Number(e.target.value) }))}
                      placeholder="যেমন: 50"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] font-bold text-[#171412]"
                    />
                    <span className="text-[10px] text-[#171412]/60 mt-0.5 block">
                      সর্বমোট কতজন শিক্ষার্থী এটি ব্যবহার করতে পারবে (যেমন: ৫০ জন)।
                    </span>
                  </div>
                </div>

                {/* Expiry Date (Optional) */}
                <div>
                  <label htmlFor="promo-expiry-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                    মেয়াদ শেষের তারিখ (Expiry Date) - optional
                  </label>
                  <input
                    id="promo-expiry-input"
                    type="date"
                    value={promoForm.expiresAt}
                    onChange={(e) => setPromoForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412]"
                  />
                  <span className="text-[10px] text-[#171412]/60 mt-0.5 block">
                    খালি রাখলে মেয়াদ থাকবে না (অনির্দিষ্টকালের জন্য কার্যকর)।
                  </span>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="promo-desc-input" className="block text-[13px] font-bold text-[#171412] mb-1">
                    বিবরণ / নোট (Description)
                  </label>
                  <input
                    id="promo-desc-input"
                    type="text"
                    value={promoForm.description}
                    onChange={(e) => setPromoForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="যেমন: আর্লি বার্ড কোহর্ট স্পেশাল ২০% ছাড় প্রোমো কোড"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] text-[#171412]"
                  />
                </div>

                {/* Active Checkbox */}
                <label className="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#fbf9ef] border border-[#171412]/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={promoForm.isActive}
                    onChange={(e) => setPromoForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#ff7722] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[13px] font-bold text-[#171412]">
                    প্রোমো কোডটি সক্রিয় রাখুন (Enable Promo Code)
                  </span>
                </label>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#171412]/15">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPromoModalOpen(false)}
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    variant="orange"
                  >
                    {editingPromoId ? 'প্রোমো আপডেট করুন' : 'প্রোমো কোড সংরক্ষণ করুন'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 3: DIRECT ASSIGN / CHANGE COURSE TO APPLICANT
        ===================================================================== */}
        {assignUserModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#171412]/75 backdrop-blur-xs overflow-y-auto"
          >
            <div className="relative w-full max-w-lg bg-[#ffffff] border-2 border-[#171412] rounded-[16px] shadow-[8px_8px_0px_#171412] p-5 sm:p-7 my-8">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#171412]/15 mb-5">
                <div>
                  <span className="text-[11px] font-extrabold text-[#813502] uppercase tracking-wider block mb-0.5">
                    অ্যাডমিন অ্যাসাইনমেন্ট
                  </span>
                  <h2
                    id="assign-modal-title"
                    className="font-display text-[22px] font-extrabold text-[#171412]"
                  >
                    শিক্ষার্থীর কোর্স নির্ধারণ করুন
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignUserModal(null)}
                  className="w-9 h-9 rounded-full bg-[#f2f0e7] hover:bg-[#e2e0d7] border border-[#171412]/30 flex items-center justify-center text-[#171412] font-bold transition-colors cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Student Summary */}
              <div className="p-3.5 rounded-[12px] bg-[#fbf9ef] border border-[#171412]/20 mb-5 text-[13px]">
                <div className="font-bold text-[#171412] text-[15px]">
                  {assignUserModal.first_name} {assignUserModal.last_name}
                </div>
                <div className="text-[#171412]/70 text-[12px] mt-0.5">
                  ইমেইল: {assignUserModal.email} · ফোন: {assignUserModal.phone}
                </div>
                {assignUserModal.course_title && (
                  <div className="mt-2 pt-2 border-t border-[#171412]/10 text-[12px]">
                    <span className="text-[#813502] font-semibold">বর্তমান কোর্স: </span>
                    <strong className="text-[#171412]">{assignUserModal.course_title}</strong> (৳{assignUserModal.final_fee || assignUserModal.course_fee || 1000})
                  </div>
                )}
              </div>

              <form onSubmit={handleAssignUserCourseSubmit} className="flex flex-col gap-4 text-left">
                <div>
                  <label htmlFor="assign-course-select" className="block text-[13px] font-bold text-[#171412] mb-1.5">
                    কাঙ্ক্ষিত কোর্স নির্বাচন করুন *
                  </label>
                  <select
                    id="assign-course-select"
                    value={assignCourseId}
                    onChange={(e) => setAssignCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#fff] border-2 border-[#171412]/30 text-[14px] font-bold text-[#171412] cursor-pointer"
                  >
                    {adminCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — [{c.category}] (৳{c.discountPrice || c.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#171412]/15">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAssignUserModal(null)}
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    variant="orange"
                  >
                    কোর্স সংরক্ষণ ও নির্ধারণ করুন
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* =====================================================================
            TAB 5: CONTACT & SUPPORT CONTROL CENTER
        ===================================================================== */}
        {activeTab === 'contact' && (
          <section aria-label="Contact and support information management" className="py-6">
            <AdminContactForm />
          </section>
        )}

      </div>
    </main>
  );
};


