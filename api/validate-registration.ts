import { waitlistStep1Schema, validateWhatsAppNumberFormat, type WaitlistFormValues } from '../src/schemas/waitlist';

export async function handleValidateRegistrationCore(body: any) {
  const phoneCheck = validateWhatsAppNumberFormat(body.phone, 'BD');
  const effectiveWa = body.sameAsPhone ? body.phone : body.whatsapp;
  const waCheck = validateWhatsAppNumberFormat(effectiveWa, 'BD');
  const candidate: WaitlistFormValues = {
    ...body,
    phone: phoneCheck.isValid ? phoneCheck.e164 : body.phone,
    whatsapp: waCheck.isValid ? waCheck.e164 : effectiveWa,
  };
  const parsed = waitlistStep1Schema.safeParse(candidate);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof WaitlistFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof WaitlistFormValues | undefined;
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      statusCode: 400,
      data: {
        success: false,
        fieldErrors,
        error: 'Please check the highlighted registration fields and try again.',
      },
    };
  }
  return {
    statusCode: 200,
    data: {
      success: true,
      normalized: parsed.data,
    },
  };
}
