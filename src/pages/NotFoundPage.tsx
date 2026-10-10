import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/Button';
import { BrandBadgeMark } from '../components/svg/BrandLogo';

export interface NotFoundPageProps {
  onRegisterClick?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onRegisterClick,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <main id="main-content" className="py-16 md:py-28">
      <div className="specimen-container max-w-2xl text-center">
        <div className="rounded-[12px] bg-[#f2f0e7] border-2 border-[#171412] p-8 sm:p-12">
          <div className="flex justify-center mb-6">
            <BrandBadgeMark className="w-16 h-16" decorative={true} />
          </div>
          <div className="font-display text-[14px] font-bold text-[#813502] tabular-nums mb-2">
            Error 404
          </div>
          <h1 className="specimen-h2 text-[#171412] mb-4">
            {t('পেজটি খুঁজে পাওয়া যায়নি।', 'Page not found.')}
          </h1>
          <p className="text-[16px] text-[#171412]/85 leading-[1.4] max-w-[42ch] mx-auto mb-8">
            {t(
              'আপনি যে পেজটি খুঁজছেন তা বিদ্যমান নেই অথবা সরিয়ে ফেলা হয়েছে। হোমপেজে ফিরে যান অথবা ওয়েটলিস্টে যুক্ত হোন।',
              'The page you are looking for does not exist or has moved. Head back to the academy homepage or join the waitlist.'
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" onClick={() => navigate('/')}>
              {t('হোমপেজে ফিরে যান', 'Back to Home')}
            </Button>
            <Button
              variant="orange"
              onClick={() => {
                if (onRegisterClick) {
                  onRegisterClick();
                } else {
                  navigate('/join');
                }
              }}
            >
              {t('ওয়েটলিস্টে যুক্ত হোন', 'Join the waitlist')}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};
