export const OFFICIAL_WHATSAPP_NUMBER = '8801804462724';
export const OFFICIAL_WHATSAPP_DISPLAY = '+880 1804-462724';
export const OFFICIAL_SUPPORT_EMAIL = 'rohit007jsr@gmail.com';
export const ADMIN_NOTIFICATION_EMAIL = 'rohit007jsr@gmail.com';

/**
 * Builds the standard WhatsApp chat URL that works seamlessly across
 * mobile devices (native WhatsApp app) and desktop (WhatsApp Web / desktop app).
 */
export function buildWhatsAppLink(messageText: string, targetNumber = OFFICIAL_WHATSAPP_NUMBER): string {
  const cleanDigits = targetNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(messageText.trim());
  return `https://wa.me/${cleanDigits}?text=${encodedText}`;
}
