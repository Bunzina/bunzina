import nodemailer from 'nodemailer';

export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
  secure: process.env.NODE_ENV === 'production',
});

export const DEFAULT_EMAIL = process.env.EMAIL ?? 'bunzina@local.com';
