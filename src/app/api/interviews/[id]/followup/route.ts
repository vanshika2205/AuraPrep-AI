import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Interview from '@/models/Interview';
import { generateFollowUp } from '@/lib/openai';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(
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

    const body = await req.json();
    const { questionText, userAnswer, questionIndex } = body;

    if (!questionText || userAnswer === undefined || questionIndex === undefined) {
      return NextResponse.json({ success: false, error: 'questionText, userAnswer, and questionIndex are required.' }, { status: 400 });
    }

    // Evaluate response to check if a follow-up query is warranted
    const result = await generateFollowUp(questionText, userAnswer, interview.role, interview.level);

    if (result.hasFollowUp && result.question) {
      // Create new subdocument question
      const newQuestion = {
        questionText: result.question,
        userAnswer: '',
        feedback: '',
        score: 0,
        modelAnswer: '',
        isFollowUp: true,
        followUpContext: result.context || 'Probing answer depth.',
        dimensions: {
          technical: 0,
          communication: 0,
          confidence: 0,
          problemSolving: 0,
          behavioral: 0
        }
      };

      // Insert follow-up into interview questions directly after current index
      interview.questions.splice(questionIndex + 1, 0, newQuestion);
      
      // Increment overall session questionCount
      interview.questionCount = interview.questions.length;

      await interview.save();

      return NextResponse.json({
        success: true,
        hasFollowUp: true,
        followUpQuestion: result.question,
        updatedQuestions: interview.questions
      });
    }

    return NextResponse.json({ success: true, hasFollowUp: false });
  } catch (error: any) {
    console.error('Error generating conversational follow-up:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
