import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send verification email
export const sendVerificationEmail = async (user) => {
  try {
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"Gym Pro" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Verify Your Gym Pro Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 10px;">
          <div style="text-align: center; padding: 20px; background: #1a1a2e; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ff6b35; margin: 0;">🏋️ Gym Pro</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Welcome ${user.name}! 👋</h2>
            <p>Thank you for joining Gym Pro. Please verify your email address to get started.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email
              </a>
            </div>
            <p style="color: #888; font-size: 12px;">This link expires in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      `,
    });

    console.log(`✅ Verification email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Email error:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (user) => {
  try {
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Gym Pro" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Reset Your Gym Pro Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 10px;">
          <div style="text-align: center; padding: 20px; background: #1a1a2e; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ff6b35; margin: 0;">🏋️ Gym Pro</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to set a new password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #888; font-size: 12px;">This link expires in 1 hour.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    });

    console.log(`✅ Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Email error:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  try {
    await transporter.sendMail({
      from: `"Gym Pro" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Welcome to Gym Pro! 🏋️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 10px;">
          <div style="text-align: center; padding: 20px; background: #1a1a2e; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ff6b35; margin: 0;">🏋️ Gym Pro</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Welcome to the family! 🎉</h2>
            <p>We're excited to have you on board. Here's what you can do:</p>
            <ul>
              <li>💪 Track your workouts</li>
              <li>📊 Monitor your progress</li>
              <li>🍽️ Log your nutrition</li>
              <li>🏆 Join challenges</li>
              <li>🤖 Get AI coaching</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Start Your Journey
              </a>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};
