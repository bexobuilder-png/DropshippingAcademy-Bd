import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCurrentUserSession, subscribeToAuthSession, UserSession } from '../services/auth';
import { DropshippingAcademyBdLogo } from './svg/BrandLogo';
import { Home, BookOpen, Award, User, Bell, Menu } from 'lucide-react';

export interface NavigationProps {
  onOpenMenu?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [session, setSession] = useState<UserSession | null>(() => getCurrentUserSession());

  useEffect(() => {
    return subscribeToAuthSession((s) => setSession(s));
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: t('হোম', 'Home'), icon: Home },
    { path: '/my-courses', label: t('মাই কোর্স', 'My Courses'), icon: BookOpen },
    { path: '/certificates', label: t('সার্টিফিকেট', 'Certificate'), icon: Award },
    { path: '/profile', label: t('প্রোফাইল', 'Profile'), icon: User },
  ];

  // If user is not logged in, show a simpler header or redirect
  // But the app shell handles routing. We just need to hide/show nav based on login status if needed.
  // The mockup shows this nav for logged in users.

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <DropshippingAcademyBdLogo className="h-8" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button 
            onClick={onOpenMenu}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full sm:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path) || (item.path === '/dashboard' && location.pathname === '/');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                  active ? 'text-[#006837]' : 'text-gray-400'
                }`}
              >
                <Icon size={20} fill={active ? 'currentColor' : 'none'} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden sm:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 flex-col py-6 px-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path) || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active 
                  ? 'bg-[#006837]/10 text-[#006837] font-bold' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
