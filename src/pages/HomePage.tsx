import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Hero from '../components/Hero';
import HomeSections from '../components/HomeSections';
import type { AnimKind } from '../components/EduAnimation';

export interface HomePageProps {
  setAnim: React.Dispatch<React.SetStateAction<null | AnimKind>>;
  onRegisterClick?: (category?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setAnim,
  onRegisterClick,
}) => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const triggerRegister = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      navigate('/registration');
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
      {/* 1. HERO SECTION */}
      <Hero
        lang={lang}
        onRegister={triggerRegister}
        onScrollToSteps={scrollToPath}
      />

      {/* 2. HOME SECTIONS (Path, Steps, FAQ, etc.) */}
      <HomeSections lang={lang} onRegister={triggerRegister} />
    </main>
  );
};
