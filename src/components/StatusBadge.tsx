import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export type ApplicantStatus = 'pending' | 'approved' | 'rejected' | 'contacted' | 'not_available';

interface StatusBadgeProps {
  status: ApplicantStatus | string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
  showIcon = true,
}) => {
  const { lang, t } = useLanguage();

  const normalized = (status || 'pending').toLowerCase() as ApplicantStatus;

  const config: Record<
    ApplicantStatus,
    {
      labelBn: string;
      labelEn: string;
      bg: string;
      text: string;
      border: string;
      dot: string;
    }
  > = {
    approved: {
      labelBn: 'অনুমোদিত',
      labelEn: 'Approved',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-500',
    },
    pending: {
      labelBn: 'অপেক্ষমান',
      labelEn: 'Pending',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
    rejected: {
      labelBn: 'বাতিল',
      labelEn: 'Rejected',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800',
      dot: 'bg-rose-500',
    },
    contacted: {
      labelBn: 'যোগাযোগ করা হয়েছে',
      labelEn: 'Contacted',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-800',
      dot: 'bg-blue-500',
    },
    not_available: {
      labelBn: 'উপলব্ধ নয়',
      labelEn: 'NOT AVAILABLE',
      bg: 'bg-stone-100 dark:bg-stone-800',
      text: 'text-stone-600 dark:text-stone-300',
      border: 'border-stone-300 dark:border-stone-700',
      dot: 'bg-stone-400',
    },
  };

  const item = config[normalized] || config.pending;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-[12px] px-2.5 py-1 gap-1.5',
    lg: 'text-[13px] px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  const label = lang === 'bn' ? item.labelBn : item.labelEn;

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={`inline-flex items-center rounded-full font-bold border tracking-wide whitespace-nowrap select-none ${item.bg} ${item.text} ${item.border} ${sizeClasses} ${className}`}
    >
      {showIcon && (
        <span
          aria-hidden="true"
          className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
