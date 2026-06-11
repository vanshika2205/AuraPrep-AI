import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Interview from '@/models/Interview';
import User from '@/models/User';
import { generateQuestions } from '@/lib/openai';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }
    
    await dbConnect();
    const interviews = await Interview.find({ userId: user._id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: interviews });
  } catch (error: any) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    await dbConnect();
    
    // Check subscription usage limit
    const usage = user.subscriptionUsage || { interviewsThisMonth: 0, interviewLimit: 5 };
    if (usage.interviewsThisMonth >= usage.interviewLimit) {
      return NextResponse.json({
        success: false,
        error: `Monthly interview limit reached (${usage.interviewsThisMonth}/${usage.interviewLimit}). Please upgrade your plan in settings.`
      }, { status: 403 });
    }

    const body = await req.json();
    const { role, level, mode, personality, jobDescription, questionCount } = body;

    if (!role || !level) {
      return NextResponse.json({ success: false, error: 'Role and level are required.' }, { status: 400 });
    }

    const count = questionCount ? parseInt(questionCount, 10) : 5;
    const interviewMode = mode || 'technical';
    const activePersonality = personality || 'strict';

    // Retrieve resume context from active authenticated user profile
    const resumeSkills = user.resumeSkills || [];
    const resumeWeaknesses = user.resumeWeaknesses || [];

    const questions = await generateQuestions(
      role,
      level,
      jobDescription,
      count,
      interviewMode,
      resumeSkills,
      resumeWeaknesses,
      activePersonality
    );

    const interview = new Interview({
      userId: user._id,
      role,
      level,
      mode: interviewMode,
      personality: activePersonality,
      jobDescription: jobDescription || '',
      questionCount: count,
      status: 'pending',
      questions: questions.map((qText) => ({
        questionText: qText,
        userAnswer: '',
        feedback: '',
        score: 0,
        modelAnswer: '',
        isFollowUp: false,
        dimensions: {
          technical: 0,
          communication: 0,
          confidence: 0,
          problemSolving: 0,
          behavioral: 0
        }
      })),
      scorecard: {
        overall: 0,
        technical: 0,
        communication: 0,
        behavioral: 0,
        confidence: 0,
        problemSolving: 0,
        summary: '',
        keyStrengths: [],
        keyImprovements: []
      },
      videoAnalytics: {
        speakingPace: 120,
        eyeContactScore: 0,
        smileCount: 0,
        confidenceScore: 0
      }
    });

    await interview.save();

    // Increment user usage counter
    user.subscriptionUsage.interviewsThisMonth = (user.subscriptionUsage.interviewsThisMonth || 0) + 1;
    await user.save();

    return NextResponse.json({ success: true, data: interview });
  } catch (error: any) {
    console.error('Error creating interview:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
