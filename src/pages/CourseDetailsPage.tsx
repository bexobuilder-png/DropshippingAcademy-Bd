import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchCoursesList } from '../services/courses';
import { CourseItem } from '../config/courses';
import { Clock, Star, CheckCircle2, ArrowLeft, PlayCircle, ShieldCheck } from 'lucide-react';
import { getCurrentUserSession } from '../services/auth';
import { CourseEnrollmentModal } from '../components/CourseEnrollmentModal';

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [userSession, setUserSession] = useState(getCurrentUserSession());

  useEffect(() => {
    const loadData = async () => {
      const list = await fetchCoursesList();
      const found = list.find(c => c.id === id);
      setCourse(found || null);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleApplyClick = () => {
    if (!userSession) {
      navigate(`/registration?courseId=${course?.id}`);
    } else {
      setShowEnrollModal(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border border-[#059669] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="text-4xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold mb-4">কোর্সটি পাওয়া যায়নি</h2>
      <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#059669] text-white rounded-xl">হোমপেজে ফিরে যান</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24 sm:pb-8 sm:pl-64">
      {/* Header with back button */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md px-4 h-14 flex items-center gap-4 border-b border-gray-100 sm:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-bold text-gray-900 truncate">{course.title}</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        {/* Course Banner */}
        <div className="relative rounded-[32px] overflow-hidden aspect-video mb-8 shadow-xl shadow-green-900/10">
          <img 
            src={course.thumbnailUrl || '/images/course_placeholder.jpg'} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#059669] text-white text-[10px] font-black rounded-lg uppercase shadow-lg">
              <ShieldCheck size={12} />
              Featured Course
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-gray-500 leading-relaxed mb-6">{course.description}</p>
          
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-center">
              <div className="flex justify-center mb-1 text-[#059669]">
                <Clock size={20} />
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Duration</p>
              <p className="text-xs font-bold">{course.duration}</p>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="flex justify-center mb-1 text-[#059669]">
                <Star size={20} fill="currentColor" />
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Rating</p>
              <p className="text-xs font-bold">4.9 (450+)</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1 text-[#059669]">
                <PlayCircle size={20} />
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Level</p>
              <p className="text-xs font-bold">Pro Edition</p>
            </div>
          </div>
        </div>

        {/* Course Highlights / Syllabus */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">কোর্সে যা থাকছে</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.highlights.map((h: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 group hover:border-[#059669]/30 transition-colors">
                <div className="mt-0.5 text-[#059669] group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={18} />
                </div>
                <p className="text-sm text-gray-600 font-medium">{h}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-20 left-4 right-4 sm:relative sm:bottom-0 sm:left-0 sm:right-0 bg-white p-6 rounded-3xl shadow-2xl border border-[#059669] sm:shadow-none flex items-center justify-center sm:mt-12 sm:p-8 sm:bg-gray-50 sm:border sm:border-gray-100">
          <button 
            onClick={handleApplyClick}
            className="w-full sm:w-auto px-12 py-4 bg-[#059669] text-white font-black text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-600/20"
          >
            Apply for this Course
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showEnrollModal && course && userSession && (
          <CourseEnrollmentModal 
            course={course}
            user={userSession}
            onClose={() => setShowEnrollModal(false)}
            onSuccess={() => {
              // Redirect to profile or show success
              navigate('/profile');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

