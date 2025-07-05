import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter (using Gmail for demo - replace with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use app password for Gmail
  }
});

// For development, you can use Ethereal Email for testing
const createTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const getTransporter = async () => {
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    return await createTestTransporter();
  }
  return transporter;
};

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const transporter = await getTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to Our App!</h1>
          <p style="color: #6b7280; font-size: 16px;">Hi ${name}, please verify your email address to get started.</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 25px;">
            Click the button below to verify your email address:
          </p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Verify Email Address
          </a>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>This verification link will expire in 24 hours.</p>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const transporter = await getTransporter();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin-bottom: 10px;">Password Reset Request</h1>
          <p style="color: #6b7280; font-size: 16px;">Hi ${name}, we received a request to reset your password.</p>
        </div>
        
        <div style="background-color: #fef2f2; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 25px;">
            Click the button below to reset your password:
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset Password
          </a>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This reset link will expire in 1 hour.</p>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};