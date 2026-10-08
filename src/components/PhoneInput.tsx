import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  getCountries,
  getCountryCallingCode,
  AsYouType,
  parsePhoneNumberFromString,
  CountryCode,
} from 'libphonenumber-js';
import { AlertCircleSvgIcon, ChevronDownSvg, CountryFlagSvg } from './svg/NavIcons';

export interface PhoneInputProps {
  id: string;
  label: string;
  value: string; // E.164 string e.g. "+8801712345678"
  onChange: (e164Value: string) => void;
  defaultCountry?: CountryCode;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
  error?: string;
}

const PRIORITY_COUNTRIES: CountryCode[] = ['BD', 'US', 'GB', 'CA', 'AU', 'IN', 'AE', 'DE', 'SG'];

const regionNames =
  typeof Intl !== 'undefined' && typeof Intl.DisplayNames !== 'undefined'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

function getCountryName(code: CountryCode): string {
  try {
    return regionNames?.of(code) || code;
  } catch {
    return code;
  }
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  label,
  value,
  onChange,
  defaultCountry = 'BD',
  disabled = false,
  required = false,
  hint,
  error,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    if (value) {
      const parsed = parsePhoneNumberFromString(value);
      if (parsed?.country) return parsed.country;
    }
    return defaultCountry;
  });

  const [nationalInput, setNationalInput] = useState<string>(() => {
    if (value) {
      const parsed = parsePhoneNumberFromString(value);
      if (parsed) {
        return parsed.formatNational();
      }
      return value;
    }
    return '';
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync when external value changes (e.g., "Same as phone number" checkbox)
  useEffect(() => {
    if (!value) {
      setNationalInput('');
      return;
    }
    const parsed = parsePhoneNumberFromString(value);
    if (parsed) {
      if (parsed.country && parsed.country !== selectedCountry) {
        setSelectedCountry(parsed.country);
      }
      const formatted = new AsYouType(parsed.country || selectedCountry).input(
        parsed.nationalNumber
      );
      setNationalInput(formatted);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 20);
    } else {
      setSearchQuery('');
    }
  }, [dropdownOpen]);

  const allCountries = useMemo(() => {
    const raw = getCountries();
    const rest = raw.filter((c) => !PRIORITY_COUNTRIES.includes(c));
    const ordered = [...PRIORITY_COUNTRIES.filter((c) => raw.includes(c)), ...rest];
    return ordered.map((code) => ({
      code,
      name: getCountryName(code),
      callingCode: `+${getCountryCallingCode(code)}`,
    }));
  }, []);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.callingCode.includes(q)
    );
  }, [allCountries, searchQuery]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setDropdownOpen(false);

    const digitsOnly = nationalInput.replace(/\D/g, '');
    if (!digitsOnly) {
      onChange('');
      return;
    }

    const callingCode = getCountryCallingCode(country);
    const candidate = `+${callingCode}${digitsOnly}`;
    const parsed = parsePhoneNumberFromString(candidate, country);
    if (parsed) {
      onChange(parsed.number);
      setNationalInput(new AsYouType(country).input(parsed.nationalNumber));
    } else {
      onChange(candidate);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // If user pastes or types full international number starting with +
    if (rawVal.startsWith('+')) {
      const parsed = parsePhoneNumberFromString(rawVal);
      if (parsed) {
        if (parsed.country) setSelectedCountry(parsed.country);
        setNationalInput(
          new AsYouType(parsed.country || selectedCountry).input(parsed.nationalNumber)
        );
        onChange(parsed.number);
        return;
      }
    }

    const digitsOnly = rawVal.replace(/\D/g, '');
    if (!digitsOnly) {
      setNationalInput('');
      onChange('');
      return;
    }

    const formatter = new AsYouType(selectedCountry);
    const formatted = formatter.input(digitsOnly);
    setNationalInput(formatted);

    const parsed = parsePhoneNumberFromString(digitsOnly, selectedCountry);
    if (parsed) {
      onChange(parsed.number); // E.164 format (+...)
    } else {
      const callingCode = getCountryCallingCode(selectedCountry);
      onChange(`+${callingCode}${digitsOnly}`);
    }
  };

  const callingCodePrefix = `+${getCountryCallingCode(selectedCountry)}`;
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
        } ${disabled ? 'opacity-60 pointer-events-none bg-[#f2f0e7]' : ''}`}
      >
        {/* Country Selector Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-label={`Selected country ${getCountryName(selectedCountry)} (${callingCodePrefix}). Click to change country`}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          className="inline-flex items-center gap-2 px-3.5 min-h-[46px] border-r border-[#171412]/15 rounded-l-[12px] bg-[#f2f0e7]/70 hover:bg-[#ebe9df] text-[#171412] text-[14px] font-bold shrink-0 cursor-pointer"
        >
          <CountryFlagSvg countryCode={selectedCountry} className="w-6 h-4 shrink-0" />
          <span className="tabular-nums">{callingCodePrefix}</span>
          <ChevronDownSvg className="w-3.5 h-3.5 text-[#171412]/70" />
        </button>

        {/* National Phone Input */}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          required={required}
          value={nationalInput}
          onChange={handleInputChange}
          placeholder="1712 345678"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-r-[12px] bg-transparent text-[#171412] text-[16px] font-medium tabular-nums placeholder:text-[#171412]/40 focus:outline-none"
        />
      </div>

      {/* Country Dropdown Listbox */}
      {dropdownOpen && (
        <div
          role="listbox"
          aria-label="Select country calling code"
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-full max-w-[340px] rounded-[12px] bg-[#fff] border-2 border-[#171412] shadow-lg overflow-hidden"
        >
          <div className="p-2 border-b border-[#171412]/15 bg-[#fbf9ef]">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or +code..."
              aria-label="Filter countries"
              className="w-full min-h-[40px] px-3 py-1.5 rounded-[8px] bg-[#fff] border border-[#171412]/25 text-[14px] text-[#171412] placeholder:text-[#171412]/45"
            />
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-[#171412]/10">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-[13px] text-[#171412]/70 text-center">
                No matching country found.
              </div>
            ) : (
              filteredCountries.map((item) => {
                const isSelected = item.code === selectedCountry;
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleCountrySelect(item.code)}
                    className={`w-full min-h-[44px] px-3.5 py-2 flex items-center justify-between text-left text-[14px] transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#ff7722]/15 font-bold text-[#171412]'
                        : 'hover:bg-[#f2f0e7] text-[#171412]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <CountryFlagSvg countryCode={item.code} className="w-6 h-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="text-[13px] font-bold text-[#813502] tabular-nums ml-2 shrink-0">
                      {item.callingCode}
                    </span>
                  </button>
                );
              })
            )}
          </div>
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
