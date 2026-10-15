import { z } from 'zod';
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  CountryCode,
} from 'libphonenumber-js';

const NAME_REGEX = /^[\p{L}\s'-]+$/u;

export const DEFAULT_WHATSAPP_CONFIRM_MESSAGE =
  "I’m confirming that this is my WhatsApp number for my registration.";

export interface WhatsAppFormatValidationResult {
  isValid: boolean;
  e164: string;
  waDigits: string;
  country?: CountryCode;
  errorReason?: 'empty' | 'invalid_format';
}

/**
 * Strips the plus sign, spaces, brackets, and hyphens (and any other non-digits)
 * so e.g. "+880 1712-345678" becomes "8801712345678".
 */
export function toWhatsAppDigits(
  phoneInput: string,
  defaultCountry: CountryCode = 'BD'
): string {
  const trimmed = (phoneInput || '').trim();
  if (!trimmed) return '';

  try {
    const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
    if (parsed && parsed.isValid()) {
      return parsed.number.replace(/[\+\s\(\)\-\[\]]/g, '').replace(/\D/g, '');
    }
  } catch {
    // Fallback below
  }

  return trimmed.replace(/[\+\s\(\)\-\[\]]/g, '').replace(/\D/g, '');
}

/**
 * Validates the entered phone/WhatsApp number format using libphonenumber-js
 * (defaulting to Bangladesh +880 when country code is omitted).
 * Note: Format validation only checks numbering-plan structure and does NOT
 * prove that the number is registered on WhatsApp.
 */
export function validateWhatsAppNumberFormat(
  rawPhone: string,
  defaultCountry: CountryCode = 'BD'
): WhatsAppFormatValidationResult {
  const trimmed = (rawPhone || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      e164: '',
      waDigits: '',
      errorReason: 'empty',
    };
  }

  try {
    let parsed = parsePhoneNumberFromString(trimmed, defaultCountry);

    // If user typed international digits starting with 880 without a leading '+'
    if ((!parsed || !parsed.isValid()) && !trimmed.startsWith('+')) {
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (digitsOnly.startsWith('880') && digitsOnly.length >= 12) {
        const parsedWithPlus = parsePhoneNumberFromString(`+${digitsOnly}`, defaultCountry);
        if (parsedWithPlus && parsedWithPlus.isValid()) {
          parsed = parsedWithPlus;
        }
      }
    }

    if (!parsed || !parsed.isValid() || !isValidPhoneNumber(parsed.number)) {
      return {
        isValid: false,
        e164: trimmed,
        waDigits: '',
        country: parsed?.country,
        errorReason: 'invalid_format',
      };
    }

    const e164 = parsed.number;
    const waDigits = e164.replace(/[\+\s\(\)\-\[\]]/g, '').replace(/\D/g, '');

    return {
      isValid: Boolean(waDigits.length >= 8),
      e164,
      waDigits,
      country: parsed.country,
    };
  } catch {
    return {
      isValid: false,
      e164: trimmed,
      waDigits: '',
      errorReason: 'invalid_format',
    };
  }
}

/**
 * Builds a WhatsApp click-to-chat URL in the required format:
 * https://wa.me/<international-number-in-digits>?text=<url-encoded-message>
 */
export function buildWhatsAppConfirmUrl(
  phoneInput: string,
  prefilledMessage: string = DEFAULT_WHATSAPP_CONFIRM_MESSAGE,
  defaultCountry: CountryCode = 'BD'
): string {
  const check = validateWhatsAppNumberFormat(phoneInput, defaultCountry);
  const digits = check.isValid ? check.waDigits : toWhatsAppDigits(phoneInput, defaultCountry);
  if (!digits) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(prefilledMessage)}`;
}

/**
 * Checks if a YYYY-MM-DD date string represents a valid date in the past
 * and the person is at least 18 years old today.
 */
export function validateAdultBirthDate(dateStr: string): {
  valid: boolean;
  reason?: string;
} {
  let iso = dateStr;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    iso = `${y}-${m}-${d}`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { valid: false, reason: 'Please enter a valid date (DD/MM/YYYY).' };
  }

  const [yearStr, monthStr, dayStr] = iso.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return { valid: false, reason: 'Please enter a real calendar date.' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (parsed > today) {
    return { valid: false, reason: 'Date of birth cannot be in the future.' };
  }

  if (year < 1905) {
    return { valid: false, reason: 'Please enter a valid birth year (1905 or later).' };
  }

  const twelveYearsAgo = new Date(
    today.getFullYear() - 12,
    today.getMonth(),
    today.getDate()
  );

  if (parsed > twelveYearsAgo) {
    return { valid: false, reason: 'বয়স সর্বনিম্ন ১২ বছর হতে হবে। ১২ বছর ঊর্ধ্বে রেজিস্ট্রেশন করতে পারবে।' };
  }

  return { valid: true };
}

export const waitlistStep1Schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters.')
    .max(50, 'First name must be 50 characters or fewer.')
    .regex(
      NAME_REGEX,
      'First name can only contain letters, spaces, hyphens, and apostrophes.'
    ),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters.')
    .max(50, 'Last name must be 50 characters or fewer.')
    .regex(
      NAME_REGEX,
      'Last name can only contain letters, spaces, hyphens, and apostrophes.'
    ),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required.')
    .superRefine((val, ctx) => {
      const check = validateAdultBirthDate(val);
      if (!check.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: check.reason || 'বয়স সর্বনিম্ন ১২ বছর হতে হবে।',
        });
      }
    }),
  phone: z
    .string()
    .min(1, 'Phone number is required.')
    .refine(
      (val) => validateWhatsAppNumberFormat(val, 'BD').isValid,
      { message: 'Please enter a valid international phone number (E.164 format).' }
    ),
  whatsapp: z
    .string()
    .min(1, 'WhatsApp number is required.')
    .refine(
      (val) => validateWhatsAppNumberFormat(val, 'BD').isValid,
      { message: 'Please enter a valid WhatsApp phone number (E.164 format).' }
    ),
  sameAsPhone: z.boolean().default(false),
  whatsappConfirmedByUser: z.boolean().optional().default(false),
  confirmedWhatsappNumber: z.string().optional().default(''),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .email('Please enter a valid email address.'),
  consentAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms of Service and Privacy Policy to continue.',
  }),
  honeypot: z.string().max(0, 'Bot submission detected.').optional(),
});

export type WaitlistFormValues = z.infer<typeof waitlistStep1Schema>;

export const otpSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Please enter all 6 digits of your verification code.'),
});
