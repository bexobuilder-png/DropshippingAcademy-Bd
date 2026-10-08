import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: <T>(bnValue: T, enValue: T) => T;
}

const LANGUAGE_STORAGE_KEY = 'da_preferred_language_v1';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Default language is Bangla ('bn') when the website is opened
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'en' || saved === 'bn') return saved;
    } catch {
      // Ignore storage errors
    }
    return 'bn';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
  };

  const toggleLang = () => {
    setLangState((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const t = <T,>(bnValue: T, enValue: T): T => {
    return lang === 'bn' ? bnValue : enValue;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
