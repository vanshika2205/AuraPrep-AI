import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }
    const body = await req.json();
    const { topicId, status } = body;

    if (!topicId || !status) {
      return NextResponse.json({ success: false, error: 'topicId and status are required.' }, { status: 400 });
    }

    // Update subdocument status
    const topic = user.learningRoadmap.find((t: any) => t._id.toString() === topicId);
    if (!topic) {
      return NextResponse.json({ success: false, error: 'Roadmap topic not found.' }, { status: 404 });
    }

    topic.status = status;
    await user.save();

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error in PUT /api/user/roadmap:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
