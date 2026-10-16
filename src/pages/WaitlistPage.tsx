import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentUserSession, UserSession, subscribeToAuthSession } from '../services/auth';
import {
  fetchWaitlistPublicDirectory,
  fetchWaitlistAggregateCounts,
  getCachedWaitlistDirectory,
  setCachedWaitlistDirectory,
  WaitlistPublicDirectoryItem,
} from '../services/waitlist';
import { AuthGuardModal } from '../components/AuthGuard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PAGE_SIZE = 25;

export const WaitlistPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [session, setSession] = useState<UserSession | null>(() => getCurrentUserSession());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(!session);

  // Synchronous cache hydration: Prevents blank screen and screen flicker
  const initialCache = getCachedWaitlistDirectory();
  const [items, setItems] = useState<WaitlistPublicDirectoryItem[]>(initialCache?.items || []);
  const [totalCount, setTotalCount] = useState<number>(initialCache?.total || 0);
  const [loading, setLoading] = useState<boolean>(!initialCache);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Auth session listener
  useEffect(() => {
    const unsub = subscribeToAuthSession((updated) => {
      setSession(updated);
      if (!updated) {
        setShowAuthModal(true);
      } else {
        setShowAuthModal(false);
      }
    });
    return () => unsub();
  }, []);

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground && items.length === 0) {
      setLoading(true);
    }

    try {
      const userEmail = session?.email || undefined;
      const userPhone = session?.phone || undefined;

      const [dirItems, counts] = await Promise.all([
        fetchWaitlistPublicDirectory(searchTerm, 300, 0, userEmail, userPhone),
        fetchWaitlistAggregateCounts(),
      ]);

      setItems(dirItems);
      setTotalCount(counts.total);
      setCachedWaitlistDirectory(dirItems, counts.total);
    } catch {
      // Fallback gracefully to existing items
    } finally {
      setLoading(false);
    }
  }, [session, searchTerm, items.length]);

  // Initial fetch and on search change
  useEffect(() => {
    if (session) {
      loadData(items.length > 0 && !searchTerm);
    }
  }, [session, searchTerm]);

  // Real-time synchronization
  useEffect(() => {
    if (!isSupabaseConfigured || !session) return;

    let channel: any = null;
    try {
      channel = supabase
        .channel('public:waitlist_privacy_feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'waitlist' },
          () => {
            // New user registered: refresh count and directory silently
            loadData(true);
          }
        )
        .subscribe();
    } catch {
      // Ignore
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [session, loadData]);

  // Filtered by first-name search
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const query = searchTerm.trim().toLowerCase();
    return items.filter((u) => (u.first_name || '').toLowerCase().includes(query));
  }, [items, searchTerm]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  return (
    <main id="main-content" className="py-8 md:py-14 bg-[#fbf9ef] text-[#171412] min-h-[85vh]">
      {/* Auth Guard Modal for signed-out visitors: Redirects to /register */}
      <AuthGuardModal
        isOpen={!session || showAuthModal}
        onClose={() => {
          if (!session) {
            navigate('/register');
          } else {
            setShowAuthModal(false);
          }
        }}
        onAuthenticated={(newSession) => {
          setSession(newSession);
          setShowAuthModal(false);
        }}
        message={t(
          'ওয়েটলিস্ট দেখতে আপনাকে প্রথমে নিবন্ধন করতে হবে।',
          'To view the waiting list social proof, you must register first.'
        )}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#813502] hover:text-[#ff7722] hover:underline"
          >
            ← {t('হোম পেইজে ফিরুন', 'Back to Home')}
          </Link>

          {session && (
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#171412] bg-[#f2f0e7] px-3.5 py-1.5 rounded-full border border-[#171412]/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#ff7722] animate-pulse"></span>
              <span>{session.firstName}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ff7722] text-[#171412]">
                {t('আপনি', 'You')}
              </span>
            </div>
          )}
        </div>

        {/* Page Heading & Metric Banner */}
        <div className="rounded-[24px] bg-[#f2f0e7] border-2 border-[#171412] p-6 sm:p-8 mb-8 shadow-[4px_4px_0px_#171412]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#ff7722]/20 text-[#813502] border border-[#ff7722]/40 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#ff7722]" />
                {t('প্রাইভেসি-ফার্স্ট সোশ্যাল প্রুফ', 'Privacy-First Directory')}
              </span>
              <h1 className="font-display text-[26px] sm:text-[34px] font-extrabold text-[#171412] leading-tight tracking-tight">
                {t('নিবন্ধিত আবেদনকারীদের ওয়েটলিস্ট', 'Registered Waiting List')}
              </h1>
              <p className="text-[14px] text-[#171412]/80 mt-1 max-w-lg font-medium leading-relaxed">
                {t(
                  'সবার ব্যক্তিগত নিরাপত্তা নিশ্চিত করতে শুধুমাত্র প্রথম নাম প্রদর্শিত হচ্ছে।',
                  'To respect student privacy, only first names are publicly shown.'
                )}
              </p>
            </div>

            {/* Total Registered Count Metric ONLY (No status breakdown!) */}
            <div className="shrink-0 bg-[#fbf9ef] border-2 border-[#171412] rounded-[18px] p-4 text-center min-w-[150px] shadow-sm">
              <span className="text-[11px] font-black text-[#813502] uppercase tracking-wider block mb-0.5">
                {t('মোট নিবন্ধিত', 'Total Registered')}
              </span>
              <span className="font-display text-[32px] sm:text-[38px] font-black text-[#171412] tabular-nums block leading-none py-1">
                {loading && totalCount === 0 ? '...' : (totalCount || items.length)}
              </span>
              <span className="text-[11px] text-[#171412]/70 font-bold">
                {t('শিক্ষার্থী যুক্ত হয়েছেন', 'Students Enrolled')}
              </span>
            </div>
          </div>
        </div>

        {/* Search by First Name */}
        <div className="mb-6">
          <div className="relative w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#171412]/50 text-[16px]">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder={t('প্রথম নাম দিয়ে খুঁজুন (যেমন: তানভীর, রহিম)...', 'Search by first name (e.g. Tanvir, Rohit)...')}
              className="w-full h-12 pl-10 pr-4 rounded-[14px] bg-[#f2f0e7] border-2 border-[#171412]/25 text-[14px] font-semibold text-[#171412] placeholder-[#171412]/45 focus:outline-none focus:border-[#ff7722] focus:bg-[#ffffff] transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#171412]/10 hover:bg-[#171412]/20 flex items-center justify-center text-[12px] font-bold text-[#171412] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List Content: Skeletons while loading */}
        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-14 rounded-[14px] bg-[#f2f0e7] border border-[#171412]/15 animate-pulse flex items-center px-4 gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-[#171412]/10"></div>
                <div className="h-4 w-28 bg-[#171412]/10 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="rounded-[18px] bg-[#f2f0e7] border-2 border-dashed border-[#171412]/25 p-8 text-center text-[#171412]">
            <p className="text-[15px] font-bold">
              {searchTerm
                ? t('এই নামে কোনো নিবন্ধিত শিক্ষার্থী পাওয়া যায়নি।', 'No matching student found by this first name.')
                : t('এখনো কোনো আবেদনকারী নিবন্ধিত হননি।', 'No registered students yet on the waitlist.')}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedItems.map((applicant, index) => {
              // FIRST NAME ONLY
              const firstNameOnly = (applicant.first_name || '').trim();
              const initial = firstNameOnly.charAt(0).toUpperCase() || 'S';

              // "You" row detection
              const isCurrentUser =
                applicant.is_me ||
                (session &&
                  applicant.first_name &&
                  applicant.first_name.trim().toLowerCase() === session.firstName.trim().toLowerCase());

              return (
                <div
                  key={applicant.id || `app-${index}`}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-[14px] border-2 transition-all ${
                    isCurrentUser
                      ? 'bg-[#ff7722]/15 border-[#ff7722] shadow-[2px_2px_0px_#ff7722]'
                      : 'bg-[#f2f0e7] border-[#171412]/15 hover:border-[#171412]/35'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar Initial */}
                    <div
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-[14px] shrink-0 ${
                        isCurrentUser
                          ? 'bg-[#ff7722] text-[#171412] border-[#171412]'
                          : 'bg-[#fbf9ef] text-[#813502] border-[#171412]/20'
                      }`}
                    >
                      {initial}
                    </div>

                    {/* First Name ONLY */}
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-extrabold text-[15px] sm:text-[16px] text-[#171412] truncate">
                        {firstNameOnly || t('নাম অপ্রকাশিত', 'Anonymous')}
                      </span>

                      {/* "You" Tag for own row */}
                      {isCurrentUser && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ff7722] text-[#171412] border border-[#171412]/30 shadow-xs">
                          {t('আপনি', 'You')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Smooth Pagination / Infinite Scroll Trigger */}
            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="min-h-[44px] px-8 rounded-[50px] bg-[#f2f0e7] hover:bg-[#e5e2d6] text-[#171412] border-2 border-[#171412] font-display text-[14px] font-extrabold cursor-pointer transition-transform active:translate-y-0.5 shadow-sm"
                >
                  {t(
                    `আরও দেখুন (বাকি ${filteredItems.length - visibleCount} জন) ↓`,
                    `Load More (${filteredItems.length - visibleCount} remaining) ↓`
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
