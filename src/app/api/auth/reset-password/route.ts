import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, otp, newPassword, confirmNewPassword } = body;

    if (!email || !otp || !newPassword || !confirmNewPassword) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid reset OTP.' }, { status: 400 });
    }

    if (!user.resetPasswordOTPExpires || user.resetPasswordOTPExpires < new Date()) {
      return NextResponse.json({ success: false, error: 'Reset OTP has expired.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    
    // Auto-verify user if they weren't verified (in case they forgot password right after registration)
    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationOTP = undefined;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login.'
    });
  } catch (error: any) {
    console.error('Error in reset-password route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
