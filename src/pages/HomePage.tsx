import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Hero from '../components/Hero';
import HomeSections from '../components/HomeSections';
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
      <HomeSections lang={lang} onRegister={triggerRegister} />
    </main>
  );
};
