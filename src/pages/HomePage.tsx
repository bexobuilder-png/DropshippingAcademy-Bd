import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentUserSession, UserSession } from '../services/auth';
import { fetchCoursesList } from '../services/courses';
import { CourseItem } from '../config/courses';
import { fetchStudentEnrollments } from '../services/enrollments';
import Hero from '../components/Hero';
import HomeSections from '../components/HomeSections';
import type { AnimKind } from '../components/EduAnimation';
import { LayoutGrid, PlayCircle, Clock, CheckCircle, Bell, Search, Star } from 'lucide-react';

export interface HomePageProps {
  setAnim: React.Dispatch<React.SetStateAction<null | AnimKind>>;
  onRegisterClick?: (category?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setAnim,
  onRegisterClick,
}) => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(() => getCurrentUserSession());
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, ongoing: 0, completed: 0 });
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const [courseList, enrollments] = await Promise.all([
        fetchCoursesList(),
        session ? fetchStudentEnrollments() : Promise.resolve([])
      ]);
      
      if (!mounted) return;
      
      setCourses(courseList.filter(c => c.isVisible));

      if (session && enrollments) {
        const userEnrollments = enrollments.filter(e => e.studentEmail === session.email);
        setStats({
          total: courseList.length,
          applied: userEnrollments.filter(e => e.status === 'pending').length,
          ongoing: userEnrollments.filter(e => e.status === 'approved').length,
          completed: 0
        });
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [session?.email]);

  const filteredCourses = React.useMemo(() => {
    return courses.filter(c => {
      const searchCat = activeCategory === 'all' ? '' : activeCategory;
      if (!searchCat) return true;
      return c.category.replace(' অ্যান্ড ', ' ') === searchCat.replace(' অ্যান্ড ', ' ');
    });
  }, [courses, activeCategory]);

  const triggerRegister = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      setAnim('intro');
      // Navigation is handled by EduAnimation onDone in App.tsx
    }
  };

  if (session) {
    return (
      <main id="main-content" className="min-h-screen bg-gray-50 pb-20 sm:pb-8 sm:pl-64">
        {/* Dashboard Header */}
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
          {/* User Card */}
          <div className="bg-[#059669] rounded-3xl p-6 text-white mb-8 relative overflow-hidden shadow-xl shadow-green-900/10">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border border-white/20 overflow-hidden bg-white/10">
                    {session.profilePic ? (
                      <img src={session.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                        {session.firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">স্বাগতম, {session.firstName} {session.lastName}</h2>
                    <p className="text-sm opacity-80">নিজেকে আরও দক্ষ করে গড়ে তুলুন, আপনার স্বপ্নের পথচলা শুরু হোক!</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: t('মোট কোর্স', 'Total Courses'), value: stats.total, icon: LayoutGrid, color: 'bg-white/10' },
                  { label: t('আবেদন করেছে', 'Applied'), value: stats.applied, icon: Clock, color: 'bg-white/10' },
                  { label: t('চলমান কোর্স', 'Ongoing Courses'), value: stats.ongoing, icon: PlayCircle, color: 'bg-white/10' },
                  { label: t('সম্পন্ন কোর্স', 'Completed'), value: stats.completed, icon: CheckCircle, color: 'bg-white/10' },
                ].map((stat, idx) => (
                  <div key={idx} className={`${stat.color} p-3 rounded-2xl border border-white/10 flex items-center gap-3`}>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] opacity-70 uppercase font-bold">{stat.label}</div>
                      <div className="text-lg font-black">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Abstract Background patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          </div>

          {/* Section: All Courses */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900">{t('সকল কোর্স সমূহ', 'All Courses')}</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {['all', 'ড্রপশিপিং অ্যান্ড রিসেলিং', 'গ্লোবাল ড্রপশিপিং'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    (cat === 'all' && (activeCategory === 'all' || !activeCategory)) || activeCategory === cat
                      ? 'bg-[#059669] text-white shadow-md'
                      : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {cat === 'all' ? t('সব', 'All') : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex items-center p-3 gap-4"
              >
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={course.thumbnailUrl || '/images/course_placeholder.jpg'} 
                    alt={course.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-bold text-gray-900 truncate group-hover:text-[#059669] transition-colors">{course.title}</h4>
                    {course.badge && (
                      <span className="shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-md uppercase border border-emerald-100">
                        {course.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock size={12} className="shrink-0" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                      <CheckCircle size={12} className="shrink-0" />
                      {course.isRunning ? 'ভর্তি চলছে' : 'নতুন ব্যাচ'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="shrink-0 px-4 py-2 bg-[#059669] text-white text-[10px] font-bold rounded-lg hover:bg-[#047857] transition-all shadow-lg active:scale-95"
                >
                  Join
                </button>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-bold">বর্তমানে কোনো কোর্স নেই</p>
                <p className="text-xs text-gray-400">অনুগ্রহ করে পরে আবার চেষ্টা করুন</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="overflow-x-hidden">
      <Hero
        lang={lang}
        onRegister={triggerRegister}
        onScrollToSteps={() => document.getElementById('path')?.scrollIntoView({ behavior: 'smooth' })}
      />
      <HomeSections lang={lang} onRegister={triggerRegister} />
    </main>
  );
};
