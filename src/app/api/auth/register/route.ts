import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { username, email, password, confirmPassword } = body;

    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match.' }, { status: 400 });
    }

    // Password strength check
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationOTP: otp,
      subscriptionPlan: 'free',
      subscriptionUsage: { interviewsThisMonth: 0, interviewLimit: 5 },
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      learningRoadmap: [
        {
          topic: 'Verbal Mock Calibration',
          difficulty: 'Easy',
          description: 'Get calibrated with your webcam, speaker, and microphone to complete your first mock interview.',
          status: 'todo',
          resources: []
        }
      ]
    });

    await newUser.save();

    console.log(`[AUTH] Verification OTP for ${email} is: ${otp}`);

    // Return the OTP in response for mock/test convenience
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Verification OTP sent.',
      otp: otp, // In a production app, this would only be sent via email
      email
    });
  } catch (error: any) {
    console.error('Error in register route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
