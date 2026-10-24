import type { Language } from '../context/LanguageContext';

export const PLACEHOLDER_FOUNDERS_FLAG = false;

export interface FounderProfile {
  id: string;
  name: string;
  nameEn?: string;
  role: string;
  roleEn?: string;
  photo: string;
  alt: string;
  rotationClass: string;
  backdropColor: string;
  chipBg: string;
  chipText: string;
  shortBio: string;
  shortBioEn?: string;
  specialty: string;
  specialtyEn?: string;
  isPlaceholder: boolean;
}

export const FOUNDERS: FounderProfile[] = [];

export const FOUNDER_STORY = {
  headline: '',
  lead: '',
  body: '',
  ctaLabel: '',
};

export const FOUNDER_STORY_EN = {
  headline: '',
  lead: '',
  body: '',
  ctaLabel: '',
};

export function getLocalizedFounderStory(lang: Language) {
  return lang === 'bn' ? FOUNDER_STORY : FOUNDER_STORY_EN;
}
