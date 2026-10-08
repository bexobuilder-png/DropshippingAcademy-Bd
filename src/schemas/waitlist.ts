import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

const NAME_REGEX = /^[\p{L}\s'-]+$/u;

/**
 * Checks if a YYYY-MM-DD date string represents a valid date in the past
 * and the person is at least 18 years old today.
 */
export function validateAdultBirthDate(isoDateStr: string): {
  valid: boolean;
  reason?: string;
} {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDateStr)) {
    return { valid: false, reason: 'Please select or enter a valid date (DD/MM/YYYY).' };
  }

  const [yearStr, monthStr, dayStr] = isoDateStr.split('-');
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

  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );

  if (parsed > eighteenYearsAgo) {
    return { valid: false, reason: 'You must be at least 18 years old to join the waitlist.' };
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
          message: check.reason || 'You must be 18+ to join.',
        });
      }
    }),
  phone: z
    .string()
    .min(1, 'Phone number is required.')
    .refine(
      (val) => {
        try {
          return isValidPhoneNumber(val);
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid international phone number (E.164 format).' }
    ),
  whatsapp: z
    .string()
    .min(1, 'WhatsApp number is required.')
    .refine(
      (val) => {
        try {
          return isValidPhoneNumber(val);
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid WhatsApp phone number (E.164 format).' }
    ),
  sameAsPhone: z.boolean().default(false),
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
