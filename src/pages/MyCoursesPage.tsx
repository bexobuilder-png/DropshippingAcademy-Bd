import React, { useEffect, useState } from 'react';
import { fetchStudentEnrollments, StudentEnrollment } from '../services/enrollments';
import { getCurrentUserSession } from '../services/auth';
import { useLanguage } from '../context/LanguageContext';
import { Clock, CheckCircle, PlayCircle, Award, BookOpen } from 'lucide-react';

export const MyCoursesPage: React.FC = () => {
  const { t } = useLanguage();
  const session = getCurrentUserSession();
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'applied' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    const loadData = async () => {
      if (!session) return;
      const all = await fetchStudentEnrollments();
      const userEnrollments = all.filter(e => e.studentEmail === session.email);
      setEnrollments(userEnrollments);
      setLoading(false);
    };
    loadData();
  }, [session]);

  const tabs = [
    { id: 'all', label: t('সব', 'All') },
    { id: 'applied', label: t('আবেদনকৃত', 'Applied') },
    { id: 'ongoing', label: t('চলমান', 'Ongoing') },
    { id: 'completed', label: t('সম্পন্ন', 'Completed') },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-600 text-[10px] font-bold">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      default:
        return null;
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    if (activeTab === 'all') return true;
    if (activeTab === 'applied') return e.status === 'pending';
    if (activeTab === 'ongoing') return e.status === 'approved'; // Assuming approved means ongoing for now
    if (activeTab === 'completed') return false; // Not implemented yet
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8 sm:pl-64">
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('আমার কোর্স সমূহ', 'My Courses')}</h1>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#059669] text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border border-[#059669] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{t('কোনো কোর্স খুঁজে পাওয়া যায়নি', 'No courses found')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-[#059669]/5 rounded-xl flex items-center justify-center text-[#059669] group-hover:bg-[#059669]/10 transition-colors">
                  <PlayCircle size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{enrollment.courseTitle}</h3>
                    {getStatusBadge(enrollment.status)}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">আবেদনের তারিখ: {new Date(enrollment.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  
                  {enrollment.status === 'pending' ? (
                    <div className="bg-orange-50 text-orange-700 text-[10px] px-2 py-1.5 rounded-lg border border-orange-100">
                      অপেক্ষমান (Admin Approval)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#059669] text-xs font-bold">
                      সফলভাবে যুক্ত <span className="w-1 h-1 bg-[#059669] rounded-full"></span> কোর্স শুরু করুন
                    </div>
                  )}
                </div>
                <div className="text-gray-400 group-hover:text-[#059669] transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
