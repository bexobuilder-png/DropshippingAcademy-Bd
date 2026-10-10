import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'orange' | 'outline' | 'ghost';
  size?: 'default' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  loadingText,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-[50px] font-body text-[13px] font-bold tracking-tight whitespace-nowrap shrink-0 transition-transform duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer select-none';

  const sizeStyles =
    size === 'lg'
      ? 'min-h-[52px] px-7 py-3.5 text-[14px]'
      : 'min-h-[44px] px-5 py-2.5 text-[13px]';

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-[#00d27a] text-[#070f1a] hover:bg-[#00ba6c] font-extrabold shadow-md shadow-[#00d27a]/25',
    orange:
      'bg-[#ff7722] text-[#070f1a] hover:bg-[#ff883d] font-extrabold shadow-md shadow-[#ff7722]/25',
    outline:
      'bg-transparent text-white border border-white/20 hover:bg-white/10 hover:border-white/40 font-bold',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/10 font-bold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : undefined}
      className={`${baseStyles} ${sizeStyles} ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {isLoading && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4 h-4 animate-spin shrink-0"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeOpacity="0.3"
          />
          <path
            d="M21 12C21 7.02944 16.9706 3 12 3"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </button>
  );
};
