import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentUserSession, UserSession, updateUserProfile, clearUserSession } from '../services/auth';
import { User, Mail, Phone, Calendar, MapPin, Transgender, LogOut, Camera, ChevronRight, Award } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [session, setSession] = useState<UserSession | null>(() =>
    getCurrentUserSession()
  );

  const handleLogout = async () => {
    await clearUserSession();
    navigate('/');
  };

  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateUserProfile({ profilePic: base64String });
        setSession(getCurrentUserSession());
      };
      reader.readAsDataURL(file);
    }
  };

  if (!session) return null;

  const infoItems = [
    { label: t('পূর্ণ নাম', 'Full Name'), value: `${session.firstName} ${session.lastName}`, icon: User },
    { label: t('ইমেইল', 'Email'), value: session.email, icon: Mail },
    { label: t('ফোন নম্বর', 'Phone Number'), value: session.whatsapp || session.phone || '+880 1712 345678', icon: Phone },
    { label: t('জন্ম তারিখ', 'Date of Birth'), value: '01 Jan 2003', icon: Calendar },
    { label: t('ঠিকানা', 'Address'), value: session.district ? `${session.district}, Bangladesh` : 'Jessore, Bangladesh', icon: MapPin },
    { label: t('লিঙ্গ', 'Gender'), value: 'পুরুষ', icon: Transgender },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-gray-50 pb-20 sm:pb-8 sm:pl-64">
      <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('প্রোফাইল', 'Profile')}</h1>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full border border-[#059669] overflow-hidden bg-white shadow-lg">
              {session.profilePic ? (
                <img src={session.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#059669] bg-green-50">
                  {session.firstName.charAt(0)}
                </div>
              )}
            </div>
            <button 
              onClick={handleProfilePicClick}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center border border-white text-white shadow-md hover:scale-110 transition-transform"
            >
              <Camera size={14} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{session.firstName} {session.lastName}</h2>
          <p className="text-sm text-gray-500 mb-6">Registered Student</p>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            ব্যক্তিগত তথ্য
          </h3>
          <div className="space-y-6">
            {infoItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-[#059669] transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold text-gray-700">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates Option */}
        <div 
          onClick={() => navigate('/certificates')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 cursor-pointer group hover:border-[#059669] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#059669]">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">আমার সার্টিফিকেট</h3>
                <p className="text-xs text-gray-500">অর্জিত সকল সার্টিফিকেট এখানে দেখুন</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-[#059669] group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl bg-white border border-red-100 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm"
        >
          <LogOut size={18} />
          <span>লগআউট করুন</span>
        </button>
      </div>
    </main>
  );
};
