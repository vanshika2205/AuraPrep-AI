import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // In production, we say "If email exists..." to prevent enumeration,
      // but for direct SaaS developer UX, we'll return user not found.
      return NextResponse.json({ success: false, error: 'No user registered with this email.' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = expiry;
    await user.save();

    console.log(`[AUTH] Password Reset OTP for ${email} is: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'Password reset OTP sent to your email.',
      otp: otp, // Return in response for mock/test convenience
      email
    });
  } catch (error: any) {
    console.error('Error in forgot-password route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
