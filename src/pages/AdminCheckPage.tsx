import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabase';
import type { FounderProfile } from '../config/founders';
import {
  ALLOWED_ADMIN_EMAILS,
  compressImageFileToDataUrl,
  createFounder,
  deleteWaitlistEntry,
  fetchAllWaitlistUsers,
  fetchFoundersList,
  FounderStoryConfig,
  getAdminSessionEmail,
  loadFounderStoryConfig,
  NewFounderInput,
  removeAllFounders,
  removeFounderById,
  restoreDefaultFoundersList,
  saveFounderStoryConfig,
  sendAdminLoginOtp,
  signOutAdmin,
  updateExistingFounder,
  updateWaitlistStatus,
  verifyAdminLoginOtp,
} from '../services/admin';
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
  const [activeTab, setActiveTab] = useState<'waitlist' | 'founders'>('waitlist');

  // Waitlist Data State
  const [waitlistRows, setWaitlistRows] = useState<WaitlistDbRow[]>([]);
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'contacted'
  >('all');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [csvExportNotice, setCsvExportNotice] = useState('');

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
    const [waitlistRes, foundersRes] = await Promise.all([
      fetchAllWaitlistUsers(),
      fetchFoundersList(),
    ]);
    setWaitlistRows(waitlistRes.rows);
    if (waitlistRes.error) {
      setWaitlistError(waitlistRes.error);
    }
    setFounders(foundersRes);
    setLoadingWaitlist(false);
  };

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
      if (!q) return true;
      const fullName = `${row.first_name} ${row.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.whatsapp.toLowerCase().includes(q)
      );
    });
  }, [waitlistRows, searchQuery, statusFilter]);

  const metrics = useMemo(() => {
    const total = waitlistRows.length;
    const pending = waitlistRows.filter((r) => r.status === 'pending').length;
    const approved = waitlistRows.filter((r) => r.status === 'approved').length;
    const contacted = waitlistRows.filter((r) => r.status === 'contacted').length;
    return { total, pending, approved, contacted };
  }, [waitlistRows]);

  const handleStatusChange = async (
    id: string,
    newStatus: 'pending' | 'approved' | 'contacted'
  ) => {
    setWaitlistRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: newStatus } : row))
    );
    await updateWaitlistStatus(id, newStatus);
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
        </div>

        {/* =====================================================================
            TAB 1: WAITLIST USERS & FULL APPLICANT INFORMATION
        ===================================================================== */}
        {activeTab === 'waitlist' && (
          <section aria-label="Waitlist users directory">
            {/* Summary Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-5">
                <div className="text-[12px] font-bold text-[#813502]">
                  Total Waitlist Users
                </div>
                <div className="font-display text-[36px] font-extrabold text-[#171412] tabular-nums mt-1">
                  {metrics.total}
                </div>
              </div>

              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-5">
                <div className="text-[12px] font-bold text-[#813502]">
                  Pending Cohort
                </div>
                <div className="font-display text-[36px] font-extrabold text-[#171412] tabular-nums mt-1">
                  {metrics.pending}
                </div>
              </div>

              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-5">
                <div className="text-[12px] font-bold text-[#813502]">
                  Approved Applicants
                </div>
                <div className="font-display text-[36px] font-extrabold text-[#171412] tabular-nums mt-1">
                  {metrics.approved}
                </div>
              </div>

              <div className="rounded-[12px] bg-[#f2f0e7] border border-[#171412]/20 p-5">
                <div className="text-[12px] font-bold text-[#813502]">
                  Contacted (Email / WhatsApp)
                </div>
                <div className="font-display text-[36px] font-extrabold text-[#171412] tabular-nums mt-1">
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
                {(['all', 'pending', 'approved', 'contacted'] as const).map((st) => (
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
                    {st}
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

                {(statusFilter !== 'all' || searchQuery.trim() !== '') && (
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
                    : 'No applicants match your current search or status filter.'}
                </p>
              </div>
            ) : (
              <div className="rounded-[12px] bg-[#fff] border-2 border-[#171412] overflow-hidden">
                <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
                  <table className="w-full text-left border-collapse min-w-[840px]">
                    <thead>
                      <tr className="bg-[#171412] text-[#fbf9ef] text-[11px] sm:text-[12px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-3 whitespace-nowrap">#</th>
                        <th className="py-3 px-3 whitespace-nowrap">Full Name</th>
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
                              <select
                                aria-label={`Status for ${user.first_name} ${user.last_name}`}
                                value={user.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    user.id,
                                    e.target.value as
                                      | 'pending'
                                      | 'approved'
                                      | 'contacted'
                                  )
                                }
                                className="min-h-[34px] px-2 py-1 rounded-[6px] bg-[#f2f0e7] border border-[#171412]/30 text-[12px] font-bold text-[#171412] cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="contacted">Contacted</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              {!isConfirmingDelete ? (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteUserId(user.id)}
                                  className="min-h-[34px] px-2.5 py-1 rounded-[6px] text-[12px] font-bold text-[#ff3c34] hover:bg-[#fff0f0] cursor-pointer"
                                >
                                  Delete
                                </button>
                              ) : (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="min-h-[32px] px-2 py-1 rounded-[4px] bg-[#ff3c34] text-[#fff] text-[11px] font-bold cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteUserId(null)}
                                    className="min-h-[32px] px-2 py-1 rounded-[4px] bg-[#f2f0e7] text-[#171412] text-[11px] font-bold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
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
      </div>
    </main>
  );
};
