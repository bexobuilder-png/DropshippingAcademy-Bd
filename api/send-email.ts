import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email, firstName, lastName } = req.body || {};

  if (!email || !firstName) {
    return res.status(400).json({ success: false, error: 'Missing required fields: email and firstName' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'support@dropshippingacademy.io',
    to: email,
    subject: 'Welcome to Dropshipping Academy Waitlist! 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fbf9ef; color: #171412; border: 2px solid #171412; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #171412; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #171412; margin: 0;">Dropshipping Academy</h1>
          <p style="font-size: 14px; color: #813502; font-weight: bold; margin: 5px 0 0 0;">The Learning Partner for Ambitious Dropshippers</p>
        </div>
        
        <h2 style="font-size: 20px; color: #171412;">Hello ${firstName} ${lastName || ''},</h2>
        
        <p style="font-size: 15px; line-height: 1.5; color: #171412;">
          Your spot on the <strong>Dropshipping Academy</strong> waitlist has been successfully confirmed and locked in our database!
        </p>
        
        <div style="background-color: #f2f0e7; border: 1.5px solid #171412; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #813502;">What happens next?</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
            <li>Priority access to Cohort 01 enrollment opening dates.</li>
            <li>Free Product Margin Calculator & 12-point scorecard sent directly to your inbox.</li>
            <li>Exclusive early-bird tuition savings.</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; color: #171412; margin-top: 25px;">
          If you have any questions, simply reply to this email or reach out to our team at <a href="mailto:support@dropshippingacademy.io" style="color: #813502; font-weight: bold;">support@dropshippingacademy.io</a>.
        </p>
        
        <div style="border-top: 1px solid #171412; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 12px; color: #171412;">
          &copy; ${new Date().getFullYear()} Dropshipping Academy. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
      console.log(`[Email Simulation] Confirmation email would be sent to ${email} for ${firstName}`);
      return res.status(200).json({ success: true, simulated: true, message: 'Simulated email sent.' });
    }

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Confirmation email sent successfully!' });
  } catch (error: any) {
    console.error('Nodemailer error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to send confirmation email.' });
  }
}
