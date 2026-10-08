import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export interface SendEmailBody {
  email: string;
  firstName: string;
  lastName?: string;
  action?: 'waitlist_confirmed' | 'approved' | 'rejected';
  customMessage?: string;
  subject?: string;
}

export interface EmailRenderResult {
  subject: string;
  html: string;
}

/**
 * Builds the waiting list confirmation email in Bangla language.
 */
export function buildWaitlistConfirmedBanglaEmail(params: {
  firstName: string;
  lastName?: string;
}): EmailRenderResult {
  const { firstName, lastName } = params;
  const fullName = `${firstName} ${lastName || ''}`.trim();
  const year = new Date().getFullYear();

  const subject = 'ড্রপশিপিং একাডেমি ওয়েটলিস্টে আপনাকে স্বাগতম! 🚀';
  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #fbf9ef; font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; color: #171412;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbf9ef; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 2px solid #171412; border-radius: 12px; overflow: hidden; box-shadow: 4px 4px 0px #171412;" cellspacing="0" cellpadding="0" border="0">
              
              <!-- Header Bar -->
              <tr>
                <td style="background-color: #ff7722; padding: 24px 20px; text-align: center; border-bottom: 2px solid #171412;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #171412; letter-spacing: -0.5px;">Dropshipping Academy</h1>
                  <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 700; color: #171412;">উচ্চাকাঙ্ক্ষী ড্রপশিপারদের বিশ্বস্ত লার্নিং প্ল্যাটফর্ম</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 28px 24px;">
                  
                  <div style="display: inline-block; background-color: #f2f0e7; border: 1.5px solid #171412; border-radius: 50px; padding: 4px 14px; font-size: 12px; font-weight: 700; color: #813502; margin-bottom: 16px;">
                    🎉 ওয়েটলিস্ট নিবন্ধন সফল
                  </div>

                  <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #171412; line-height: 1.3;">
                    প্রিয় ${fullName},
                  </h2>

                  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #171412;">
                    <strong>ড্রপশিপিং একাডেমি (Dropshipping Academy)</strong> ওয়েটলিস্টে আপনার নাম সফলভাবে অন্তর্ভুক্ত ও নিশ্চিত হয়েছে! আমাদের লার্নিং কমিউনিটিতে আপনাকে আন্তরিক স্বাগতম।
                  </p>

                  <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #171412;">
                    আমরা বাংলাদেশ ও আন্তর্জাতিক মার্কেটে সফল ড্রপশিপিং বিজনেস গড়ে তোলার জন্য সম্পূর্ণ প্র্যাকটিক্যাল প্রশিক্ষণ প্রদান করি। আপনার আসনটি আমাদের ডাটাবেসে সুরক্ষিতভাবে লক করা হয়েছে।
                  </p>

                  <!-- Next Steps Panel -->
                  <div style="background-color: #fbf9ef; border: 2px solid #171412; border-radius: 10px; padding: 20px; margin: 24px 0;">
                    <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; color: #813502;">
                      🚀 এরপর কী ঘটবে?
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7; color: #171412;">
                      <li style="margin-bottom: 8px;"><strong>অগ্রাধিকারমূলক এনরোলমেন্ট:</strong> কোহর্ট ০১ (Cohort 01) ব্যাচের ভর্তি উন্মুক্ত হওয়ার সাথে সাথে আপনি অগ্রাধিকার ভিত্তিতে আসন বুক করার নোটিফিকেশন পাবেন।</li>
                      <li style="margin-bottom: 8px;"><strong>ফ্রি রিসোর্স ও টুলস:</strong> প্রোডাক্ট মার্জিন ক্যালকুলেটর ও ১২-পয়েন্ট উইনিং প্রোডাক্ট স্কোরকার্ড সরাসরি আপনার ইমেইলে পাঠিয়ে দেওয়া হবে।</li>
                      <li style="margin-bottom: 0;"><strong>এক্সক্লুসিভ আর্লি-বার্ড ছাড়:</strong> শুধুমাত্র ওয়েটলিস্ট মেম্বারদের জন্য থাকবে বিশেষ ডিসকাউন্ট সুবিধা।</li>
                    </ul>
                  </div>

                  <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.6; color: #171412;">
                    আপনার কোনো জিজ্ঞাসা বা পরামর্শ থাকলে নির্দ্বিধায় সরাসরি এই ইমেইলে রিপ্লাই করতে পারেন অথবা আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন: 
                    <a href="mailto:support@dropshippingacademy.io" style="color: #ff7722; font-weight: 800; text-decoration: underline;">support@dropshippingacademy.io</a>
                  </p>

                  <div style="margin-top: 24px; padding-top: 18px; border-top: 1px dashed #171412;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #171412;">শুভকামনায়,</p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #813502; font-weight: 800;">ড্রপশিপিং একাডেমি টিম</p>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f2f0e7; border-top: 2px solid #171412; padding: 16px 20px; text-align: center; font-size: 12px; color: #171412;">
                  <p style="margin: 0 0 4px 0;">&copy; ${year} Dropshipping Academy. সর্বস্বত্ব সংরক্ষিত।</p>
                  <p style="margin: 0; color: #813502; font-size: 11px;">আপনি Dropshipping Academy ওয়েটলিস্টে নিবন্ধন করার কারণে এই ইমেইলটি পেয়েছেন।</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Builds the user approval update email in Bangla language with custom message support.
 */
export function buildApprovalBanglaEmail(params: {
  firstName: string;
  lastName?: string;
  customMessage?: string;
  customSubject?: string;
}): EmailRenderResult {
  const { firstName, lastName, customMessage, customSubject } = params;
  const fullName = `${firstName} ${lastName || ''}`.trim();
  const year = new Date().getFullYear();

  const subject = customSubject || 'অভিনন্দন! ড্রপশিপিং একাডেমিতে আপনার আবেদন অনুমোদিত হয়েছে 🎉';
  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #fbf9ef; font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; color: #171412;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbf9ef; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 2px solid #171412; border-radius: 12px; overflow: hidden; box-shadow: 4px 4px 0px #171412;" cellspacing="0" cellpadding="0" border="0">
              
              <!-- Header Bar -->
              <tr>
                <td style="background-color: #2e7d32; padding: 24px 20px; text-align: center; border-bottom: 2px solid #171412;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Dropshipping Academy</h1>
                  <p style="margin: 6px 0 0 0; font-size: 14px; font-weight: 700; color: #e8f5e9;">আবেদন অনুমোদন নোটিফিকেশন</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 28px 24px;">
                  
                  <div style="display: inline-block; background-color: #e8f5e9; border: 1.5px solid #2e7d32; border-radius: 50px; padding: 4px 14px; font-size: 12px; font-weight: 800; color: #1b5e20; margin-bottom: 16px;">
                    ✅ আবেদন অনুমোদিত (Application Approved)
                  </div>

                  <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #171412; line-height: 1.3;">
                    অভিনন্দন ${fullName}! 🎉
                  </h2>

                  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #171412;">
                    আমরা অত্যন্ত আনন্দের সাথে জানাচ্ছি যে <strong>ড্রপশিপিং একাডেমি (Dropshipping Academy) কোহর্ট ০১</strong>-এর জন্য আপনার আবেদনটি সফলভাবে <strong>অনুমোদিত</strong> হয়েছে!
                  </p>

                  <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #171412;">
                    আপনার আগ্রহ, প্রোফাইল এবং ড্রপশিপিং উদ্যোগ গড়ে তোলার আগ্রহ পর্যালোচনা করে আমাদের বিশেষ ব্যাচের জন্য আপনাকে মনোনীত করা হয়েছে।
                  </p>

                  ${
                    customMessage && customMessage.trim()
                      ? `
                    <!-- Admin Custom Message Box -->
                    <div style="background-color: #fff9e6; border: 2px solid #ff7722; border-radius: 10px; padding: 18px; margin: 22px 0;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #813502;">
                        📢 অ্যাডমিনের বিশেষ বার্তা ও নির্দেশনা:
                      </p>
                      <div style="margin: 0; font-size: 14px; line-height: 1.7; color: #171412; white-space: pre-line;">${customMessage.trim()}</div>
                    </div>
                  `
                      : ''
                  }

                  <!-- Next Steps Panel -->
                  <div style="background-color: #f2f0e7; border: 2px solid #171412; border-radius: 10px; padding: 20px; margin: 24px 0;">
                    <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; color: #171412;">
                      📋 পরবর্তী করণীয় (Next Steps):
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7; color: #171412;">
                      <li style="margin-bottom: 8px;"><strong>আসন নিশ্চিতকরণ:</strong> আপনার অনুমোদিত আসনটি লক করতে পরবর্তী ৪৮ ঘণ্টার মধ্যে বিস্তারিত অনবোর্ডিং নির্দেশনা ও ব্যাচ শিডিউল আপনার ইমেইল ও হোয়াটসঅ্যাপে পাঠানো হবে।</li>
                      <li style="margin-bottom: 8px;"><strong>টেকনিক্যাল প্রস্তুতি:</strong> হ্যান্ডস-অন সেশন ও লাইভ ল্যাবের জন্য একটি ল্যাপটপ/ডেস্কটপ এবং স্থিতিশীল ইন্টারনেট সংযোগ প্রস্তুত রাখুন।</li>
                      <li style="margin-bottom: 0;"><strong>কমিউনিটি এক্সেস:</strong> ব্যাচ শুরুর পূর্বে আপনাকে আমাদের প্রাইভেট স্টুডেন্ট কমিউনিটি গ্রুপে যুক্ত করা হবে।</li>
                    </ul>
                  </div>

                  <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.6; color: #171412;">
                    যেকোনো প্রয়োজনে সরাসরি এই ইমেইলে রিপ্লাই করুন অথবা আমাদের টিমের সাথে যোগাযোগ করুন: 
                    <a href="mailto:support@dropshippingacademy.io" style="color: #2e7d32; font-weight: 800; text-decoration: underline;">support@dropshippingacademy.io</a>
                  </p>

                  <div style="margin-top: 24px; padding-top: 18px; border-top: 1px dashed #171412;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #171412;">আন্তরিক শুভেচ্ছাসহ,</p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #2e7d32; font-weight: 800;">অ্যাডমিশন টিম · ড্রপশিপিং একাডেমি</p>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f2f0e7; border-top: 2px solid #171412; padding: 16px 20px; text-align: center; font-size: 12px; color: #171412;">
                  <p style="margin: 0 0 4px 0;">&copy; ${year} Dropshipping Academy. সর্বস্বত্ব সংরক্ষিত।</p>
                  <p style="margin: 0; color: #813502; font-size: 11px;">Dropshipping Academy আবেদন আপডেট সংক্রান্ত অফিশিয়াল ইমেইল।</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Builds the user rejection update email in Bangla language with custom message support.
 */
export function buildRejectionBanglaEmail(params: {
  firstName: string;
  lastName?: string;
  customMessage?: string;
  customSubject?: string;
}): EmailRenderResult {
  const { firstName, lastName, customMessage, customSubject } = params;
  const fullName = `${firstName} ${lastName || ''}`.trim();
  const year = new Date().getFullYear();

  const subject = customSubject || 'ড্রপশিপিং একাডেমি আবেদন সংক্রান্ত আপডেট 📋';
  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #fbf9ef; font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; color: #171412;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbf9ef; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 2px solid #171412; border-radius: 12px; overflow: hidden; box-shadow: 4px 4px 0px #171412;" cellspacing="0" cellpadding="0" border="0">
              
              <!-- Header Bar -->
              <tr>
                <td style="background-color: #374151; padding: 24px 20px; text-align: center; border-bottom: 2px solid #171412;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Dropshipping Academy</h1>
                  <p style="margin: 6px 0 0 0; font-size: 14px; font-weight: 700; color: #e5e7eb;">আবেদন সংক্রান্ত নোটিফিকেশন</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 28px 24px;">
                  
                  <div style="display: inline-block; background-color: #f3f4f6; border: 1.5px solid #4b5563; border-radius: 50px; padding: 4px 14px; font-size: 12px; font-weight: 800; color: #374151; margin-bottom: 16px;">
                    ℹ️ আবেদন স্ট্যাটাস আপডেট
                  </div>

                  <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #171412; line-height: 1.3;">
                    প্রিয় ${fullName},
                  </h2>

                  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #171412;">
                    <strong>ড্রপশিপিং একাডেমি (Dropshipping Academy)</strong> কোহর্টে আগ্রহ প্রকাশ করার জন্য আপনাকে আন্তরিক ধন্যবাদ জানাচ্ছি।
                  </p>

                  <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #171412;">
                    অত্যন্ত সতর্কতার সাথে আপনার আবেদন পর্যালোচনা করার পর দুঃখের সাথে জানাচ্ছি যে, এই কোহর্টে সীমিত আসন ও বিপুল সংখ্যক প্রার্থীর কারণে এই মুহূর্তে আপনার আবেদনটি গ্রহণ করা সম্ভব হয়নি (আবেদন প্রত্যাখ্যাত)।
                  </p>

                  ${
                    customMessage && customMessage.trim()
                      ? `
                    <!-- Admin Custom Message Box -->
                    <div style="background-color: #f9fafb; border: 2px solid #6b7280; border-radius: 10px; padding: 18px; margin: 22px 0;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #1f2937;">
                        📝 আবেদন সংক্রান্ত আপডেট ও মন্তব্য:
                      </p>
                      <div style="margin: 0; font-size: 14px; line-height: 1.7; color: #374151; white-space: pre-line;">${customMessage.trim()}</div>
                    </div>
                  `
                      : ''
                  }

                  <!-- Encouragement Panel -->
                  <div style="background-color: #fbf9ef; border: 2px solid #171412; border-radius: 10px; padding: 20px; margin: 24px 0;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 800; color: #813502;">
                      🌱 এটি কোনো সমাপ্তি নয়:
                    </h3>
                    <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #171412;">
                      আমাদের পরবর্তী কোহর্টে যখন নতুন ব্যাচের আবেদন শুরু হবে, তখন আপনার পূর্ববর্তী আবেদনটি অগ্রাধিকার ভিত্তিতে পর্যালোচনা করা হবে।
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #171412;">
                      ততক্ষণ পর্যন্ত মার্কেট রিসার্চ, সাপ্লায়ার সোর্সিং এবং ডিজিটাল কমার্সের সাথে যুক্ত থাকার জন্য শুভকামনা জানাচ্ছি।
                    </p>
                  </div>

                  <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.6; color: #171412;">
                    কোনো তথ্য বা প্রশ্নের জন্য যোগাযোগ করুন: 
                    <a href="mailto:support@dropshippingacademy.io" style="color: #ff7722; font-weight: 800; text-decoration: underline;">support@dropshippingacademy.io</a>
                  </p>

                  <div style="margin-top: 24px; padding-top: 18px; border-top: 1px dashed #171412;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #171412;">ধন্যবাদান্তে,</p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #813502; font-weight: 800;">অ্যাডমিশন রিভিউ টিম · ড্রপশিপিং একাডেমি</p>
                  </div>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f2f0e7; border-top: 2px solid #171412; padding: 16px 20px; text-align: center; font-size: 12px; color: #171412;">
                  <p style="margin: 0 0 4px 0;">&copy; ${year} Dropshipping Academy. সর্বস্বত্ব সংরক্ষিত।</p>
                  <p style="margin: 0; color: #813502; font-size: 11px;">Dropshipping Academy আবেদন আপডেট সংক্রান্ত অফিশিয়াল ইমেইল।</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Core handler for dispatching emails via Nodemailer with simulated fallback when SMTP is not configured.
 */
export async function handleSendEmailCore(body: SendEmailBody): Promise<{
  statusCode: number;
  data: {
    success: boolean;
    simulated?: boolean;
    message?: string;
    error?: string;
    action?: string;
    recipient?: string;
  };
}> {
  const { email, firstName, lastName, action = 'waitlist_confirmed', customMessage, subject: customSubject } = body || {};

  if (!email || !firstName) {
    return {
      statusCode: 400,
      data: { success: false, error: 'Missing required fields: email and firstName' },
    };
  }

  let emailContent: EmailRenderResult;

  if (action === 'approved') {
    emailContent = buildApprovalBanglaEmail({
      firstName,
      lastName,
      customMessage,
      customSubject,
    });
  } else if (action === 'rejected') {
    emailContent = buildRejectionBanglaEmail({
      firstName,
      lastName,
      customMessage,
      customSubject,
    });
  } else {
    // Default waitlist confirmed
    emailContent = buildWaitlistConfirmedBanglaEmail({
      firstName,
      lastName,
    });
  }

  // Ensure the sender identifier prominently displays 'Dropshipping Academy'
  // with a valid email address matching the authenticated SMTP server.
  const authenticatedUser = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  let senderEmail = authenticatedUser || 'support@dropshippingacademy.io';

  if (process.env.EMAIL_FROM) {
    const fromMatch = process.env.EMAIL_FROM.match(/<([^>]+)>/);
    if (fromMatch && fromMatch[1]) {
      senderEmail = fromMatch[1].trim();
    } else if (process.env.EMAIL_FROM.includes('@')) {
      senderEmail = process.env.EMAIL_FROM.trim();
    }
  }

  const mailOptions = {
    from: `"Dropshipping Academy" <${senderEmail}>`,
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
  };

  const hasSmtpConfig = !!(process.env.SMTP_USER || process.env.EMAIL_USER);

  if (!hasSmtpConfig) {
    const actionLabel =
      action === 'approved'
        ? 'অনুমোদন (Approved)'
        : action === 'rejected'
        ? 'প্রত্যাখ্যান (Rejected)'
        : 'ওয়েটলিস্ট নিশ্চিতকরণ (Waitlist Confirmed)';

    console.log(`[Nodemailer Simulation] ${actionLabel} email generated in Bangla for ${email} (${firstName} ${lastName || ''})`);
    return {
      statusCode: 200,
      data: {
        success: true,
        simulated: true,
        action,
        recipient: email,
        message: `[সিমুলেশন] ${actionLabel} ইমেইল সফলভাবে তৈরি ও সিমুলেট করা হয়েছে (বাংলা ভাষায়)। SMTP ক্রেডেনশিয়াল যোগ করলে সরাসরি ইনবক্সে পৌঁছাবে।`,
      },
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail(mailOptions);

    const actionSuccessLabel =
      action === 'approved'
        ? 'অনুমোদন ইমেইল'
        : action === 'rejected'
        ? 'প্রত্যাখ্যান ইমেইল'
        : 'ওয়েটলিস্ট নিশ্চিতকরণ ইমেইল';

    return {
      statusCode: 200,
      data: {
        success: true,
        action,
        recipient: email,
        message: `${actionSuccessLabel} সফলভাবে ${email} ঠিকানায় পাঠানো হয়েছে!`,
      },
    };
  } catch (error: any) {
    console.error('Nodemailer error:', error);
    return {
      statusCode: 500,
      data: {
        success: false,
        error: error?.message || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে। দয়া করে SMTP কনফিগারেশন চেক করুন।',
      },
    };
  }
}

/**
 * Vercel Serverless Function entry point.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const result = await handleSendEmailCore(req.body || {});
  return res.status(result.statusCode).json(result.data);
}
