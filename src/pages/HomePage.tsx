import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Hero from '../components/Hero';
import HomeSections from '../components/HomeSections';
import { RunningCourseCard } from '../components/RunningCourseCard';
import type { AnimKind } from '../components/EduAnimation';

export interface HomePageProps {
  setAnim: React.Dispatch<React.SetStateAction<null | AnimKind>>;
  onRegisterClick?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setAnim,
  onRegisterClick,
}) => {
  const { lang, t } = useLanguage();

  const triggerRegister = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      setAnim('intro');
    }
  };

  const scrollToPath = () => {
    const el = document.getElementById('path');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main id="main-content" className="overflow-x-hidden">
      {/* HERO & SECTIONS */}
      <Hero lang={lang} onRegister={triggerRegister} onScrollToSteps={scrollToPath} />

      {/* Featured Running Course Card below Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <RunningCourseCard variant="featured" onLearnMore={scrollToPath} />
      </div>

      <HomeSections lang={lang} onRegister={triggerRegister} />
    </main>
  );
};
