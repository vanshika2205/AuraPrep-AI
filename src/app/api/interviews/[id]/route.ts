import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Interview from '@/models/Interview';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const interview = await Interview.findById(id);

    if (!interview) {
      return NextResponse.json({ success: false, error: 'Interview session not found.' }, { status: 404 });
    }

    if (interview.userId && interview.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not own this interview.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: interview });
  } catch (error: any) {
    console.error('Error retrieving interview session details:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
