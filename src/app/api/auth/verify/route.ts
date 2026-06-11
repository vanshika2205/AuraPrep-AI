import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Email and OTP are required.' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    if (user.verificationOTP !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid verification OTP.' }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    await user.save();

    const token = signToken({ userId: user._id.toString(), email: user.email }, false);

    const response = NextResponse.json({
      success: true,
      message: 'Account verified successfully.',
      data: {
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges
      }
    });

    // Set cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Error in verification route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
