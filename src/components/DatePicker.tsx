import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  AlertCircleSvgIcon,
  CalendarSvgIcon,
  ChevronLeftSvg,
  ChevronRightSvg,
} from './svg/NavIcons';

export interface DatePickerProps {
  id: string;
  label: string;
  value: string; // ISO YYYY-MM-DD
  onChange: (isoDate: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isoToDisplay(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function displayToIso(display: string): string | null {
  const match = display.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  return `${y}-${m}-${d}`;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  hint,
  error,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const maxAdultYear = today.getFullYear() - 18;
  const minYear = 1920;

  const [textValue, setTextValue] = useState<string>(() => isoToDisplay(value));
  const [isOpen, setIsOpen] = useState(false);

  const initialViewDate = useMemo(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m] = value.split('-').map(Number);
      if (y >= minYear && y <= maxAdultYear) {
        return { year: y, month: m - 1 };
      }
    }
    return { year: maxAdultYear - 4, month: 0 };
  }, [value, maxAdultYear]);

  const [viewYear, setViewYear] = useState<number>(initialViewDate.year);
  const [viewMonth, setViewMonth] = useState<number>(initialViewDate.month);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTextValue(isoToDisplay(value));
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Auto-format digits into DD/MM/YYYY if typing numbers
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;

    if (raw.length >= textValue.length) {
      if (digits.length <= 2) {
        formatted = digits;
      } else if (digits.length <= 4) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
      }
    }

    setTextValue(formatted);

    const iso = displayToIso(formatted);
    if (iso) {
      onChange(iso);
      const [y, m] = iso.split('-').map(Number);
      if (y >= minYear && y <= today.getFullYear()) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    } else if (formatted.trim() === '') {
      onChange('');
    }
  };

  const yearsList = useMemo(() => {
    const arr: number[] = [];
    for (let y = maxAdultYear; y >= minYear; y--) {
      arr.push(y);
    }
    return arr;
  }, [maxAdultYear]);

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const firstDayOffset = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  const isDateDisabled = (year: number, month: number, day: number): boolean => {
    const candidate = new Date(year, month, day);
    candidate.setHours(0, 0, 0, 0);
    if (candidate > today) return true;
    const cutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return candidate > cutoff;
  };

  const handleDaySelect = (day: number) => {
    if (isDateDisabled(viewYear, viewMonth, day)) return;
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const iso = `${viewYear}-${mStr}-${dStr}`;
    onChange(iso);
    setTextValue(`${dStr}/${mStr}/${viewYear}`);
    setIsOpen(false);
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > minYear) {
        setViewYear((y) => y - 1);
        setViewMonth(11);
      }
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < maxAdultYear) {
        setViewYear((y) => y + 1);
        setViewMonth(0);
      }
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 w-full relative">
      <label htmlFor={id} className="text-[14px] font-bold text-[#171412]">
        {label}
        {required && (
          <span className="text-[#813502] ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-[13px] text-[#171412]/80 leading-snug">
          {hint}
        </p>
      )}

      <div
        className={`flex items-stretch rounded-[12px] bg-[#fff] border transition-colors ${
          error
            ? 'border-[#ff3c34] bg-[#fff8f8]'
            : 'border-[#171412]/25 hover:border-[#171412]'
        }`}
      >
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          value={textValue}
          onChange={handleTextChange}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className="w-full min-h-[46px] px-4 py-2.5 rounded-l-[12px] bg-transparent text-[#171412] text-[16px] font-medium tabular-nums placeholder:text-[#171412]/45 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open calendar date picker"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="min-w-[48px] min-h-[46px] px-3 flex items-center justify-center rounded-r-[12px] border-l border-[#171412]/15 bg-[#f2f0e7]/70 hover:bg-[#ebe9df] text-[#171412] cursor-pointer"
        >
          <CalendarSvgIcon className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Date of birth calendar picker (18+ required)"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-full max-w-[330px] rounded-[12px] bg-[#fff] border-2 border-[#171412] p-4 shadow-xl"
        >
          {/* Month & Year Selectors */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Previous month"
              className="min-w-[38px] min-h-[38px] rounded-[8px] flex items-center justify-center border border-[#171412]/20 hover:bg-[#f2f0e7] text-[#171412] cursor-pointer"
            >
              <ChevronLeftSvg className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 flex-1">
              <select
                aria-label="Select birth month"
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="flex-1 min-h-[38px] px-2 py-1 rounded-[8px] bg-[#fbf9ef] border border-[#171412]/25 text-[13px] font-bold text-[#171412] cursor-pointer"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                aria-label="Select birth year"
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="w-[82px] min-h-[38px] px-2 py-1 rounded-[8px] bg-[#fbf9ef] border border-[#171412]/25 text-[13px] font-bold text-[#171412] tabular-nums cursor-pointer"
              >
                {yearsList.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Next month"
              className="min-w-[38px] min-h-[38px] rounded-[8px] flex items-center justify-center border border-[#171412]/20 hover:bg-[#f2f0e7] text-[#171412] cursor-pointer"
            >
              <ChevronRightSvg className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-[11px] font-bold text-[#813502] py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const disabled = isDateDisabled(viewYear, viewMonth, dayNum);
              const isoCandidate = `${viewYear}-${String(viewMonth + 1).padStart(
                2,
                '0'
              )}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = value === isoCandidate;

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDaySelect(dayNum)}
                  aria-label={`${dayNum} ${MONTHS[viewMonth]} ${viewYear}`}
                  aria-pressed={isSelected}
                  className={`h-9 rounded-[8px] text-[13px] font-bold tabular-nums flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#ff7722] text-[#171412] border border-[#171412]'
                      : disabled
                      ? 'text-[#171412]/25 cursor-not-allowed'
                      : 'text-[#171412] hover:bg-[#f2f0e7]'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <p className="mt-3 pt-2 border-t border-[#171412]/10 text-[12px] text-[#171412]/75 text-center">
            Applicants must be 18 years or older.
          </p>
        </div>
      )}

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
};
