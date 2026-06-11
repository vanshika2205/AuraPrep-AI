import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.'
    });

    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Expire instantly
    });

    return response;
  } catch (error: any) {
    console.error('Error in logout route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
