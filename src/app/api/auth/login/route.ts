import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, password, rememberMe, isMockOAuth, provider, mockUsername, mockEmail } = body;

    // Support visual mock OAuth login flow out of the box
    if (isMockOAuth) {
      if (!mockEmail) {
        return NextResponse.json({ success: false, error: 'OAuth email missing.' }, { status: 400 });
      }
      
      let user = await User.findOne({ email: mockEmail });
      if (!user) {
        user = new User({
          username: mockUsername || 'OAuth User',
          email: mockEmail,
          isVerified: true,
          subscriptionPlan: 'free',
          subscriptionUsage: { interviewsThisMonth: 0, interviewLimit: 5 },
          xp: 100,
          level: 1,
          streak: 1,
          badges: []
        });
        await user.save();
      }

      const token = signToken({ userId: user._id.toString(), email: user.email }, true);
      const response = NextResponse.json({
        success: true,
        message: `Logged in via ${provider || 'Social'} OAuth.`,
        data: user
      });

      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days for OAuth
      });

      return response;
    }

    // Normal email credentials flow
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 400 });
    }

    const isMatch = await comparePassword(password, user.password || '');
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 400 });
    }

    if (!user.isVerified) {
      // Return details so frontend can route to verification OTP check screen
      return NextResponse.json({ 
        success: false, 
        error: 'Account email is not verified.', 
        requiresVerification: true,
        email: user.email 
      }, { status: 403 });
    }

    const token = signToken({ userId: user._id.toString(), email: user.email }, rememberMe);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      data: user
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 // 30 days vs 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Error in login route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
