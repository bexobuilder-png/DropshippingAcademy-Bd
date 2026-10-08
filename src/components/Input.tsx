import React from 'react';
import { AlertCircleSvgIcon } from './svg/NavIcons';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, hint, error, className = '', required, ...rest }, ref) => {
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label
          htmlFor={id}
          className="text-[14px] font-bold text-[#171412] flex items-center justify-between"
        >
          <span>
            {label}
            {required && (
              <span className="text-[#813502] ml-1" aria-hidden="true">
                *
              </span>
            )}
          </span>
        </label>

        {hint && (
          <p id={hintId} className="text-[13px] text-[#171412]/80 leading-snug">
            {hint}
          </p>
        )}

        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={`w-full min-h-[46px] px-4 py-2.5 rounded-[12px] bg-[#fff] text-[#171412] text-[16px] font-medium placeholder:text-[#171412]/45 border transition-colors ${
            error
              ? 'border-[#ff3c34] bg-[#fff8f8]'
              : 'border-[#171412]/25 hover:border-[#171412]'
          } ${className}`}
          {...rest}
        />

        {error && (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            className="flex items-start gap-1.5 text-[13px] font-semibold text-[#ff3c34] mt-0.5"
          >
            <AlertCircleSvgIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
