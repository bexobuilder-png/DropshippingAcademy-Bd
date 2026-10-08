import React, { useRef } from 'react';
import { AlertCircleSvgIcon } from './svg/NavIcons';

export interface OtpInputProps {
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  error?: string;
}

const OTP_LENGTH = 6;

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Pad or slice value into 6 slots
  const digits = Array.from({ length: OTP_LENGTH }, (_, idx) => value[idx] || '');

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    inputRefs.current[clamped]?.focus();
    inputRefs.current[clamped]?.select();
  };

  const handleDigitChange = (index: number, rawVal: string) => {
    const numeric = rawVal.replace(/\D/g, '');
    if (!numeric) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      onChange(nextDigits.join(''));
      return;
    }

    // If user typed or autofilled multiple digits into a single box
    if (numeric.length > 1) {
      const pasted = numeric.slice(0, OTP_LENGTH).split('');
      const nextDigits = [...digits];
      pasted.forEach((char, offset) => {
        if (index + offset < OTP_LENGTH) {
          nextDigits[index + offset] = char;
        }
      });
      onChange(nextDigits.join(''));
      focusBox(Math.min(index + pasted.length, OTP_LENGTH - 1));
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = numeric[0];
    onChange(nextDigits.join(''));

    if (index < OTP_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        onChange(nextDigits.join(''));
      } else if (index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        onChange(nextDigits.join(''));
        focusBox(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusBox(index + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusBox(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusBox(OTP_LENGTH - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedData) return;
    onChange(pastedData);
    focusBox(Math.min(pastedData.length, OTP_LENGTH - 1));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        role="group"
        aria-label="6-digit email verification code"
        className="grid grid-cols-6 gap-2 sm:gap-3 max-w-[400px]"
      >
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            maxLength={6}
            disabled={disabled}
            value={digit}
            aria-label={`Verification code digit ${idx + 1} of ${OTP_LENGTH}`}
            aria-invalid={error ? 'true' : 'false'}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`w-full h-14 sm:h-16 text-center font-display text-[24px] sm:text-[28px] font-extrabold tabular-nums rounded-[12px] bg-[#fff] text-[#171412] border-2 transition-colors ${
              error
                ? 'border-[#ff3c34] bg-[#fff8f8]'
                : digit
                ? 'border-[#171412] bg-[#fbf9ef]'
                : 'border-[#171412]/25 hover:border-[#171412]'
            } disabled:opacity-50`}
          />
        ))}
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-1.5 text-[13px] font-semibold text-[#ff3c34] mt-1"
        >
          <AlertCircleSvgIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
