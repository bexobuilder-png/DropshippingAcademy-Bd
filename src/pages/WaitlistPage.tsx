import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentUserSession, UserSession, subscribeToAuthSession } from '../services/auth';
import {
  fetchWaitlistPublicDirectory,
  fetchWaitlistAggregateCounts,
  WaitlistPublicDirectoryItem,
  WaitlistCounts,
} from '../services/waitlist';
import { StatusBadge } from '../components/StatusBadge';
import { AuthGuardModal } from '../components/AuthGuard';

export const WaitlistPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [session, setSession] = useState<UserSession | null>(() => getCurrentUserSession());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(!session);
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<WaitlistPublicDirectoryItem[]>([]);
  const [counts, setCounts] = useState<WaitlistCounts>({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const unsub = subscribeToAuthSession((updated) => {
      setSession(updated);
      if (!updated) {
        setShowAuthModal(true);
      }
    });
    return () => unsub();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dirItems, aggCounts] = await Promise.all([
        fetchWaitlistPublicDirectory(statusFilter, searchTerm),
        fetchWaitlistAggregateCounts(),
      ]);
      setItems(dirItems);
      setCounts(aggCounts);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, statusFilter, searchTerm]);

  const filteredItems = useMemo(() => {
    return items.filter((u) => {
      const matchesSearch =
        !searchTerm.trim() ||
        (u.first_name || '').toLowerCase().includes(searchTerm.trim().toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || (u.status || 'pending').toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  return (
    <main id="main-content" className="py-8 md:py-14 bg-[#fbf9ef] text-[#171412] min-h-[80vh]">
      {/* Auth Guard Modal if not signed in */}
      <AuthGuardModal
        isOpen={!session || showAuthModal}
        onClose={() => {
          if (!session) {
            navigate('/join');
          } else {
            setShowAuthModal(false);
          }
        }}
        onAuthenticated={(newSession) => {
          setSession(newSession);
          setShowAuthModal(false);
        }}
        message={t(
          'To access this information, you must register first.',
          'To access this information, you must register first.'
        )}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#813502] hover:underline"
          >
            ← {t('হোম পেইজে ফিরুন', 'Back to Home')}
          </Link>

          {session && (
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#171412]/80 bg-[#f2f0e7] px-3 py-1 rounded-full border border-[#171412]/15">
              <span>{t('আপনার প্রোফাইল:', 'Your Profile:')}</span>
              <strong className="text-[#171412]">{session.firstName}</strong>
              <StatusBadge status={session.status} size="sm" showIcon={false} />
            </div>
          )}
        </div>

        {/* Page Heading & Social Proof Banner */}
        <div className="rounded-[24px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-[#ff7722]/20 text-[#813502] border border-[#ff7722]/40 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#ff7722]" />
                {t('রিয়েল-টাইম তালিকা', 'Real-Time Directory')}
              </span>
              <h1 className="font-display text-[26px] sm:text-[34px] font-extrabold text-[#171412] leading-tight tracking-tight">
                {t('নিবন্ধিত আবেদনকারীদের ওয়েটলিস্ট', 'Registered Waiting List')}
              </h1>
              <p className="text-[14px] text-[#171412]/80 mt-1 max-w-xl">
                {t(
                  'সবার ব্যক্তিগত গোপনীয়তা নিশ্চিত করতে শুধুমাত্র প্রথম নাম ও বর্তমান আবেদন অবস্থা প্রদর্শিত হচ্ছে।',
                  'To protect applicant privacy, only first names and official admission statuses are displayed.'
                )}
              </p>
            </div>

            {/* Total Count Metric */}
            <div className="shrink-0 bg-[#fbf9ef] border border-[#171412]/20 rounded-2xl p-4 text-center min-w-[140px]">
              <span className="text-[12px] font-bold text-[#813502] uppercase tracking-wider block">
                {t('মোট নিবন্ধিত', 'Total Registered')}
              </span>
              <span className="font-display text-[32px] sm:text-[36px] font-black text-[#171412] tabular-nums block">
                {loading ? '...' : (counts.total || items.length)}
              </span>
              <span className="text-[11px] text-[#171412]/60 font-medium">
                {counts.approved} {t('অনুমোদিত', 'approved')} · {counts.pending} {t('অপেক্ষমান', 'pending')}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search by First Name */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#171412]/40">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('প্রথম নাম দিয়ে খুঁজুন...', 'Search by first name...')}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#f2f0e7] border border-[#171412]/20 text-[14px] text-[#171412] placeholder-[#171412]/40 focus:outline-none focus:border-[#ff7722]"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((filterKey) => {
              const label =
                filterKey === 'all'
                  ? t('সকল', 'All')
                  : filterKey === 'pending'
                  ? t('অপেক্ষমান', 'Pending')
                  : filterKey === 'approved'
                  ? t('অনুমোদিত', 'Approved')
                  : t('বাতিল', 'Rejected');

              const isActive = statusFilter === filterKey;

              return (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setStatusFilter(filterKey)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#171412] text-[#fbf9ef] shadow-xs'
                      : 'bg-[#f2f0e7] text-[#171412]/80 hover:bg-[#e5e2d6] border border-[#171412]/15'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-[#f2f0e7] border border-[#171412]/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-[#f2f0e7] border-2 border-dashed border-[#171412]/20 p-8 text-center text-[#171412]">
            <p className="text-[15px] font-bold">
              {searchTerm || statusFilter !== 'all'
                ? t('কোনো ফলাফল পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার দেখুন।', 'No matching applicants found. Adjust your search or filter.')
                : t('এখনো কোনো আবেদনকারী নিবন্ধিত হননি।', 'No registered applicants on the waitlist yet.')}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((applicant, index) => {
              // Strictly display FIRST NAME ONLY per user confirmation!
              const firstNameOnly = (applicant.first_name || '').trim();

              const formattedDate = applicant.created_at
                ? new Date(applicant.created_at).toLocaleDateString(
                    lang === 'bn' ? 'bn-BD' : 'en-GB',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }
                  )
                : '';

              const isCurrentUser =
                session &&
                applicant.first_name &&
                applicant.first_name.trim().toLowerCase() === session.firstName.trim().toLowerCase();

              return (
                <div
                  key={applicant.id || `app-${index}`}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isCurrentUser
                      ? 'bg-[#ff7722]/10 border-[#ff7722] shadow-xs'
                      : 'bg-[#f2f0e7] border-[#171412]/15 hover:border-[#171412]/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#171412]/10 border border-[#171412]/15 flex items-center justify-center font-bold text-[13px] text-[#813502] shrink-0">
                      {firstNameOnly.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[14px] sm:text-[15px] text-[#171412] truncate">
                          {firstNameOnly || t('নাম অপ্রকাশিত', 'Anonymous')}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ff7722] text-[#171412]">
                            {t('আপনি', 'You')}
                          </span>
                        )}
                      </div>
                      {formattedDate && (
                        <span className="text-[11px] text-[#171412]/60 font-medium">
                          {formattedDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <StatusBadge status={applicant.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
